import {
  createLogger,
  createQdrantClient,
  ensureCollection,
  getConfig,
  OpenAIService,
  upsertChunksWithVectors,
} from "@kol-hatorah/core";
import fs from "fs/promises";
import minimist from "minimist";
import path from "path";
import { SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE } from "../constants";
import { findHebrewMergedFile, loadSefariaSegmentsFromMerged } from "../sefariaLoader";
import { getSQLiteManager } from "../sqlite";

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
    ? createQdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
      })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const checkpointFilePath = path.join(process.cwd(), SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE);
  let checkpoint: Record<string, boolean> = {};
  if (!reset) {
    try {
      const checkpointData = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(checkpointData);
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded mishnah-all checkpoint.");
    } catch {
      logger.info("No mishnah-all checkpoint found; starting fresh.");
    }
  }

  let ingestedCount = 0;
  for (const work of tractates) {
    if (limit > 0 && ingestedCount >= limit) break;
    if (resetWork.includes(work)) {
      delete checkpoint[work];
    }
    if (checkpoint[work]) {
      logger.info({ work }, "Skipping (already ingested in checkpoint).");
      continue;
    }

    const target: any = { type: "mishnah", work, categoryGuess: "Mishnah" };
    const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
    if (!findResult.filePath) {
      logger.warn({ work }, "No Hebrew merged file found in Mishnah root; skipping.");
      if (findResult.candidates.length) {
        logger.info({ candidates: findResult.candidates.slice(0, 5) }, "Closest candidates");
      }
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    logger.info({ work, mergedPath: findResult.filePath }, "Loading Mishnah segments...");
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
        logger.warn({ work }, "No embeddings generated; skipping Qdrant upsert.");
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

  logger.info({ ingestedCount, ingestedSummary }, "✅ Mishnah all ingestion complete.");
  process.exit(0);
}
