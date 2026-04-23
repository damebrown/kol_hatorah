import minimist from "minimist";
import path from "path";
import fs from "fs/promises";
import {
  getConfig,
  createLogger,
  createQdrantClient,
  createEmbeddingService,
  ensureCollection,
  upsertChunksWithVectors,
  TextType,
} from "@kol-hatorah/core";
import { loadCheckpoint, saveCheckpoint } from "../../ingest/checkpoint";
import { findHebrewMergedFile, loadSefariaSegmentsFromMerged } from "../../sefariaLoader";
import { getSQLiteManager } from "../../storage/sqlite";
import { runIngestTanakhCommentaries } from "../../ingest/ingestTanakhCommentaries";

const SEFARIA_TANAKH_ALL_CHECKPOINT_FILE = ".checkpoints/sefaria-tanakh-all.json";
const SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE = ".checkpoints/sefaria-mishnah-all.json";

export async function ingestSefariaTanakhAllCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(argv.limit || "0", 10);
  const reset = !!argv.reset;
  const resetWork = argv["reset-work"] ? String(argv["reset-work"]).split(",").map((s: string) => s.trim()) : [];
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;
  const ingestedSummary: Array<{ work: string; path: string; destinations: string[] }> = [];

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot ingest Tanakh.");
    process.exit(1);
  }

  const listDirs = async (p: string) => {
    try {
      const entries = await fs.readdir(p, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  };

  const torahRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Torah");
  const prophetsRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Prophets");
  const writingsRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Writings");
  const torah = await listDirs(torahRoot);
  const prophets = await listDirs(prophetsRoot);
  const writings = await listDirs(writingsRoot);
  const tanakhTargets = [...torah, ...prophets, ...writings].map((w) => ({ type: "tanakh" as TextType, work: w, categoryGuess: "Tanakh" as const }));

  const allWorksSet = new Set(tanakhTargets.map((t) => t.work));
  const remainingWorks = [...allWorksSet];

  logger.info(
    {
      discovered: allWorksSet.size,
      remaining: remainingWorks.length,
      remainingWorks,
    },
    "Tanakh discovery summary",
  );

  if (remainingWorks.length === 0) {
    logger.info("No remaining Tanakh works to ingest (all done or excluded).");
    process.exit(0);
  }

  const qdrantClient = doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey })
    : null;
  const embeddingService = doQdrant ? createEmbeddingService(config) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info({ collectionName, limit, doQdrant, doSqlite }, "Ingesting Tanakh...");

  let checkpoint = reset ? {} : await loadCheckpoint(SEFARIA_TANAKH_ALL_CHECKPOINT_FILE);
  logger.info({ done: Object.keys(checkpoint).length }, "Loaded tanakh checkpoint.");

  const sqlite = doSqlite ? await getSQLiteManager() : null;
  let ingestedCount = 0;

  try {
    for (const work of remainingWorks) {
      if (limit > 0 && ingestedCount >= limit) break;
      if (resetWork.includes(work)) delete checkpoint[work];
      if (checkpoint[work]) {
        logger.info({ work }, "Skipping (already ingested in checkpoint).");
        continue;
      }

      const target: any = { type: "tanakh", work, categoryGuess: "Tanakh" };
      const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
      if (!findResult.filePath) {
        logger.warn({ work }, "No Hebrew merged file found in category root; skipping.");
        checkpoint[work] = true;
        await saveCheckpoint(SEFARIA_TANAKH_ALL_CHECKPOINT_FILE, checkpoint);
        continue;
      }

      logger.info({ work, mergedPath: findResult.filePath }, "Loading Sefaria segments...");
      const segments = await loadSefariaSegmentsFromMerged(findResult.filePath, target);
      if (!segments.length) {
        logger.warn({ work }, "No segments loaded; skipping.");
        checkpoint[work] = true;
        await saveCheckpoint(SEFARIA_TANAKH_ALL_CHECKPOINT_FILE, checkpoint);
        continue;
      }

      if (sqlite) sqlite.insertSegments(segments);

      if (doQdrant && embeddingService && qdrantClient) {
        const embeddings = await embeddingService.embedTexts(segments.map(c => c.text), { inputType: "search_document" });
        if (!embeddings.length) {
          logger.warn({ work }, "No embeddings generated; skipping Qdrant upsert.");
        } else {
          const vectorSize = embeddings[0].length;
          await ensureCollection(qdrantClient, collectionName, vectorSize);
          const UPSERT_BATCH_SIZE = 32;
          for (let i = 0; i < segments.length; i += UPSERT_BATCH_SIZE) {
            await upsertChunksWithVectors(qdrantClient, collectionName, segments.slice(i, i + UPSERT_BATCH_SIZE), embeddings.slice(i, i + UPSERT_BATCH_SIZE));
          }
        }
      }

      ingestedCount += segments.length;
      checkpoint[work] = true;
      await saveCheckpoint(SEFARIA_TANAKH_ALL_CHECKPOINT_FILE, checkpoint);
      ingestedSummary.push({ work, path: findResult.filePath, destinations: [...(doSqlite ? ["sqlite"] : []), ...(doQdrant ? [collectionName] : [])] });
      logger.info({ work, added: segments.length, totalIngested: ingestedCount }, "Ingested work and checkpoint saved.");
    }
  } finally {
    sqlite?.close();
  }

  logger.info({ ingestedCount, ingestedSummary }, "✅ Tanakh ingestion complete.");
  process.exit(0);
}

export async function ingestSefariaMishnahAllCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(argv.limit || "0", 10);
  const reset = !!argv.reset;
  const resetWork = argv["reset-work"] ? String(argv["reset-work"]).split(",").map((s: string) => s.trim()) : [];
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;
  const ingestedSummary: Array<{ work: string; path: string; destinations: string[] }> = [];

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot ingest Mishnah.");
    process.exit(1);
  }

  const listDirs = async (p: string) => {
    try {
      const entries = await fs.readdir(p, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  };

  const mishnahRoot = path.join(config.sefariaExportPath, "json", "Mishnah");
  const allowedSeders = new Set(["Seder Zeraim", "Seder Moed", "Seder Nashim", "Seder Nezikin", "Seder Kodashim", "Seder Tahorot"]);
  const seders = (await listDirs(mishnahRoot)).filter((s) => allowedSeders.has(s));
  const tractateSet = new Set<string>();
  for (const seder of seders) {
    const sederPath = path.join(mishnahRoot, seder);
    const tractatesInSeder = await listDirs(sederPath);
    tractatesInSeder.forEach((t) => tractateSet.add(t));
  }
  const tractates = [...tractateSet];
  if (!tractates.length) {
    logger.warn("No Mishnah tractates discovered under json/Mishnah; nothing to ingest.");
    process.exit(0);
  }

  const qdrantClient = doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey })
    : null;
  const embeddingService = doQdrant ? createEmbeddingService(config) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  let checkpoint = reset ? {} : await loadCheckpoint(SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE);
  logger.info({ done: Object.keys(checkpoint).length }, "Loaded mishnah checkpoint.");

  const sqlite = doSqlite ? await getSQLiteManager() : null;
  let ingestedCount = 0;

  try {
    for (const work of tractates) {
      if (limit > 0 && ingestedCount >= limit) break;
      if (resetWork.includes(work)) delete checkpoint[work];
      if (checkpoint[work]) {
        logger.info({ work }, "Skipping (already ingested in checkpoint).");
        continue;
      }

      const target: any = { type: "mishnah", work, categoryGuess: "Mishnah" as const };
      const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
      if (!findResult.filePath) {
        logger.warn({ work }, "No Hebrew merged file found; skipping.");
        checkpoint[work] = true;
        await saveCheckpoint(SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE, checkpoint);
        continue;
      }

      logger.info({ work, mergedPath: findResult.filePath }, "Loading Sefaria segments...");
      const segments = await loadSefariaSegmentsFromMerged(findResult.filePath, target);
      if (!segments.length) {
        logger.warn({ work }, "No segments loaded; skipping.");
        checkpoint[work] = true;
        await saveCheckpoint(SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE, checkpoint);
        continue;
      }

      if (sqlite) sqlite.insertSegments(segments);

      if (doQdrant && embeddingService && qdrantClient) {
        const embeddings = await embeddingService.embedTexts(segments.map(c => c.text), { inputType: "search_document" });
        if (!embeddings.length) {
          logger.warn({ work }, "No embeddings generated; skipping Qdrant upsert.");
        } else {
          const vectorSize = embeddings[0].length;
          await ensureCollection(qdrantClient, collectionName, vectorSize);
          const UPSERT_BATCH_SIZE = 32;
          for (let i = 0; i < segments.length; i += UPSERT_BATCH_SIZE) {
            await upsertChunksWithVectors(qdrantClient, collectionName, segments.slice(i, i + UPSERT_BATCH_SIZE), embeddings.slice(i, i + UPSERT_BATCH_SIZE));
          }
        }
      }

      ingestedCount += segments.length;
      checkpoint[work] = true;
      await saveCheckpoint(SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE, checkpoint);
      ingestedSummary.push({ work, path: findResult.filePath, destinations: [...(doSqlite ? ["sqlite"] : []), ...(doQdrant ? [collectionName] : [])] });
      logger.info({ work, added: segments.length, totalIngested: ingestedCount }, "Ingested work and checkpoint saved.");
    }
  } finally {
    sqlite?.close();
  }

  logger.info({ ingestedCount, ingestedSummary }, "✅ Mishnah ingestion complete.");
  process.exit(0);
}

export async function ingestTanakhCommentariesCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(argv.limit || argv._?.[0] || "0", 10);
  const reset = !!argv.reset;
  const resetPath = argv["reset-path"] ? String(argv["reset-path"]).split(",").map((s: string) => s.trim()) : [];
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;
  const qdrantBatchSize = argv["qdrant-batch-size"] ? parseInt(argv["qdrant-batch-size"], 10) : undefined;
  const apiConcurrency = argv["api-concurrency"] ? parseInt(argv["api-concurrency"], 10) : undefined;

  await runIngestTanakhCommentaries({
    limit: limit || undefined,
    reset,
    resetPaths: resetPath,
    doQdrant,
    doSqlite,
    qdrantBatchSize,
    apiConcurrency,
  });
  process.exit(0);
}
