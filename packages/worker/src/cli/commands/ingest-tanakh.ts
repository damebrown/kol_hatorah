import {
  createLogger,
  createQdrantClient,
  ensureCollection,
  getConfig,
  OpenAIService,
  TextType,
  upsertChunksWithVectors,
} from "@kol-hatorah/core";
import fs from "fs/promises";
import minimist from "minimist";
import path from "path";
import { SEFARIA_TANAKH_ALL_CHECKPOINT_FILE } from "../constants";
import { findHebrewMergedFile, loadSefariaSegmentsFromMerged } from "../sefariaLoader";
import { getSQLiteManager } from "../sqlite";

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
    ? createQdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
      })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info({ collectionName, limit, doQdrant, doSqlite }, "Ingesting Tanakh...");

  const checkpointFilePath = path.join(process.cwd(), SEFARIA_TANAKH_ALL_CHECKPOINT_FILE);
  let checkpoint: Record<string, boolean> = {};
  if (!reset) {
    try {
      const checkpointData = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(checkpointData);
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded tanakh checkpoint.");
    } catch {
      logger.info("No tanakh checkpoint found; starting fresh.");
    }
  }

  let ingestedCount = 0;
  for (const work of remainingWorks) {
    if (limit > 0 && ingestedCount >= limit) break;
    if (resetWork.includes(work)) {
      delete checkpoint[work];
    }
    if (checkpoint[work]) {
      logger.info({ work }, "Skipping (already ingested in checkpoint).");
      continue;
    }

    const target: any = { type: "tanakh", work, categoryGuess: "Tanakh" };
    const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
    if (!findResult.filePath) {
      logger.warn({ work }, "No Hebrew merged file found in category root; skipping.");
      if (findResult.candidates.length) {
        logger.info({ candidates: findResult.candidates.slice(0, 5) }, "Closest candidates");
      }
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    logger.info({ work, mergedPath: findResult.filePath }, "Loading Sefaria segments...");
    const segments = await loadSefariaSegmentsFromMerged(findResult.filePath, target);
    if (!segments.length) {
      logger.warn({ work }, "No segments loaded; skipping.");
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    if (doSqlite) {
      const sqlite = await getSQLiteManager();
      try {
        sqlite.insertSegments(segments);
      } finally {
        sqlite.close();
      }
    }

    if (doQdrant && openaiService && qdrantClient) {
      const textsToEmbed = segments.map((c) => c.text);
      const embeddings = await openaiService.embedTexts(textsToEmbed);
      if (!embeddings.length) {
        logger.warn({ work: target.work }, "No embeddings generated; skipping Qdrant upsert.");
      } else {
        const vectorSize = embeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);

        const UPSERT_BATCH_SIZE = 32;
        for (let i = 0; i < segments.length; i += UPSERT_BATCH_SIZE) {
          const chunkBatch = segments.slice(i, i + UPSERT_BATCH_SIZE);
          const vectorBatch = embeddings.slice(i, i + UPSERT_BATCH_SIZE);
          await upsertChunksWithVectors(qdrantClient, collectionName, chunkBatch, vectorBatch);
        }
      }
    }

    ingestedCount += segments.length;
    checkpoint[work] = true;
    await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
    await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
    ingestedSummary.push({
      work,
      path: findResult.filePath,
      destinations: [...(doSqlite ? ["sqlite"] : []), ...(doQdrant ? [collectionName] : [])],
    });
    logger.info({ work, added: segments.length, totalIngested: ingestedCount }, "Ingested work and checkpoint saved.");

    if (limit > 0 && ingestedCount >= limit) break;
  }

  logger.info({ ingestedCount, ingestedSummary }, "✅ Tanakh ingestion complete.");
  process.exit(0);
}
