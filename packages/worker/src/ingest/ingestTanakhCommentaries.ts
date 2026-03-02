/**
 * Ingestion pipeline for Tanakh commentaries from Sefaria export.
 * Scope: Rishonim on Tanakh, Acharonim on Tanakh, Modern Commentary on Tanakh.
 *
 * Qdrant upsert tuning (env vars, overridable via CLI):
 *   QDRANT_UPSERT_TIMEOUT_MS   - Client timeout in ms (default 300000)
 *   QDRANT_UPSERT_BATCH_SIZE   - Chunks per upsert batch (default 32)
 *   QDRANT_UPSERT_CONCURRENCY  - Max parallel upserts (default 6)
 *
 * CLI flags: --qdrant-batch-size N, --qdrant-concurrency N
 */

import path from "path";
import fs from "fs/promises";
import { createHash } from "crypto";
import pLimit from "p-limit";
import {
  getConfig,
  createLogger,
  createQdrantClient,
  ensureCollection,
  upsertChunksWithVectors,
  OpenAIService,
  Chunk,
} from "@kol-hatorah/core";
import { getSQLiteManager } from "../storage/sqlite";
import {
  extractCommentaryLeaves,
  encodeSectionPath,
  type SectionPathComponent,
} from "./commentaryExtractor";
import { splitOversizedChunks, MAX_EMBED_CHARS } from "./splitOversizedChunks";

const COMMENTARY_BASE_DIRS = [
  "Rishonim on Tanakh",
  "Acharonim on Tanakh",
  "Modern Commentary on Tanakh",
];

const MERGED_JSON = "merged.json";

export type CommentaryFamily = "rishonim" | "acharonim" | "modern";

function getFamilyFromRelPath(relPath: string): CommentaryFamily {
  if (relPath.startsWith("Rishonim on Tanakh/")) return "rishonim";
  if (relPath.startsWith("Acharonim on Tanakh/")) return "acharonim";
  if (relPath.startsWith("Modern Commentary on Tanakh/")) return "modern";
  return "rishonim";
}

async function collectMergedJsonFiles(
  dir: string,
  base: string,
  acc: string[] = []
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, "/");
    if (e.isDirectory()) {
      await collectMergedJsonFiles(full, base, acc);
    } else if (e.name === MERGED_JSON) {
      // Only Hebrew; path structure is .../Hebrew/merged.json or .../English/merged.json
      if (rel.endsWith("/Hebrew/merged.json")) {
        acc.push(rel);
      }
    }
  }
  return acc;
}

/**
 * Discover all merged.json under the 3 commentary base directories.
 */
export async function discoverCommentaryFiles(
  tanakhRoot: string
): Promise<string[]> {
  const all: string[] = [];
  for (const sub of COMMENTARY_BASE_DIRS) {
    const dir = path.join(tanakhRoot, sub);
    try {
      await fs.access(dir);
    } catch {
      continue;
    }
    const files = await collectMergedJsonFiles(dir, tanakhRoot);
    all.push(...files);
  }
  return all.sort();
}

export function createDocId(relPath: string): string {
  return createHash("sha1").update(relPath).digest("hex").substring(0, 16);
}

export function createChunkIdFromRef(ref: string): string {
  return createHash("sha1").update(ref).digest("hex").substring(0, 32);
}

export interface CommentaryChunk {
  id: string;
  text: string;
  source: string;
  type: "tanakh_commentary";
  work: string;
  ref: string;
  normalizedRef: string;
  lang: "he" | "en";
  createdAt: string;
  sourcePath?: string;
  family?: CommentaryFamily;
  sectionNames?: string[];
  sectionPath?: SectionPathComponent[];
}

export async function runIngestTanakhCommentaries(opts: {
  limit?: number;
  reset?: boolean;
  resetPaths?: string[];
  doQdrant?: boolean;
  doSqlite?: boolean;
  /** Qdrant upsert batch size (default from QDRANT_UPSERT_BATCH_SIZE or 16). */
  qdrantBatchSize?: number;
  /** Max concurrent Qdrant upserts (default from QDRANT_UPSERT_CONCURRENCY or 4). */
  qdrantConcurrency?: number;
}): Promise<void> {
  const {
    limit = 0,
    reset = false,
    resetPaths = [],
    doQdrant = true,
    doSqlite = true,
    qdrantBatchSize,
    qdrantConcurrency,
  } = opts;

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env.");
    process.exit(1);
  }

  const tanakhRoot = path.join(config.sefariaExportPath, "json", "Tanakh");
  const files = await discoverCommentaryFiles(tanakhRoot);
  logger.info({ count: files.length }, "Discovered commentary merged.json files");

  const checkpointFilePath = path.join(process.cwd(), ".checkpoints/sefaria-tanakh-commentaries.json");
  let checkpoint: Record<string, boolean> = {};
  if (!reset) {
    try {
      const data = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(data);
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded checkpoint.");
    } catch {
      logger.info("No checkpoint found; starting fresh.");
    }
  }

  for (const p of resetPaths) {
    delete checkpoint[p];
  }

  const upsertTimeoutMs = parseInt(process.env.QDRANT_UPSERT_TIMEOUT_MS || "300000", 10);
  const batchSize = qdrantBatchSize ?? parseInt(process.env.QDRANT_UPSERT_BATCH_SIZE || "32", 10);
  const concurrency = qdrantConcurrency ?? parseInt(process.env.QDRANT_UPSERT_CONCURRENCY || "6", 10);

  const qdrantClient = doQdrant
    ? createQdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
        timeout: upsertTimeoutMs,
      })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const limitFn = pLimit(concurrency);
  let totalChunks = 0;
  let filesProcessed = 0;

  for (const relPath of files) {
    if (checkpoint[relPath]) {
      continue;
    }
    if (limit > 0 && totalChunks >= limit) break;

    const absPath = path.join(tanakhRoot, relPath);
    let parsed: any;
    try {
      const raw = await fs.readFile(absPath, "utf8");
      parsed = JSON.parse(raw);
    } catch (err) {
      logger.warn({ relPath, err }, "Failed to read/parse file; skipping.");
      checkpoint[relPath] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    const title = parsed?.title ?? "Unknown";
    const lang = parsed?.language === "en" ? "en" : "he";
    const sectionNames = Array.isArray(parsed?.sectionNames) ? parsed.sectionNames : [];
    const text = parsed?.text;
    if (!text) {
      checkpoint[relPath] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    const family = getFamilyFromRelPath(relPath);
    const docId = createDocId(relPath);
    const chunks: CommentaryChunk[] = [];
    const createdAt = new Date().toISOString();

    for (const leaf of extractCommentaryLeaves(text)) {
      const encoded = encodeSectionPath(leaf.sectionPath);
      const ref = `${docId}:${encoded}`;
      const id = createChunkIdFromRef(ref);
      chunks.push({
        id,
        text: leaf.text,
        source: "sefaria",
        type: "tanakh_commentary",
        work: title,
        ref,
        normalizedRef: ref,
        lang,
        createdAt,
        sourcePath: relPath,
        family,
        sectionNames,
        sectionPath: leaf.sectionPath,
      });
    }

    if (chunks.length === 0) {
      checkpoint[relPath] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    const chunksAfterSplit = splitOversizedChunks(chunks, MAX_EMBED_CHARS, logger);

    const remaining = limit > 0 ? Math.max(0, limit - totalChunks) : chunksAfterSplit.length;
    const toIngest = limit > 0 ? chunksAfterSplit.slice(0, remaining) : chunksAfterSplit;
    if (toIngest.length === 0) break;

    const chunkPayloads = toIngest as Chunk[];

    if (doSqlite) {
      const sqlite = await getSQLiteManager();
      try {
        sqlite.insertSegments(chunkPayloads);
      } finally {
        sqlite.close();
      }
    }

    if (doQdrant && openaiService && qdrantClient) {
      const textsToEmbed = toIngest.map((c) => c.text);
      const embeddings = await openaiService.embedTexts(textsToEmbed);
      if (embeddings.length) {
        const vectorSize = embeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);

        const minBatchForSplit = 8;
        const upsertOne = (b: Chunk[], v: number[][]) =>
          upsertChunksWithVectors(qdrantClient, collectionName, b, v, {
            onRetry: (r) =>
              logger.warn(
                { collection: r.collection, batchSize: r.batchSize, attempt: r.attempt, firstId: r.firstId, lastId: r.lastId, error: r.error },
                "Qdrant upsert retry"
              ),
          });

        const upsertWithFallback = async (b: Chunk[], v: number[][]): Promise<void> => {
          try {
            await upsertOne(b, v);
          } catch (err) {
            if (b.length > minBatchForSplit) {
              const mid = Math.floor(b.length / 2);
              await upsertWithFallback(b.slice(0, mid), v.slice(0, mid));
              await upsertWithFallback(b.slice(mid), v.slice(mid));
            } else {
              throw err;
            }
          }
        };

        const batchPromises: Promise<void>[] = [];
        for (let i = 0; i < toIngest.length; i += batchSize) {
          const batch = chunkPayloads.slice(i, i + batchSize);
          const vectorBatch = embeddings.slice(i, i + batchSize);
          batchPromises.push(limitFn(() => upsertWithFallback(batch, vectorBatch)));
        }
        logger.info({ batches: batchPromises.length, concurrency, batchSize }, "Qdrant upsert in flight");
        await Promise.all(batchPromises);
      }
    }

    totalChunks += toIngest.length;
    filesProcessed += 1;
    checkpoint[relPath] = true;
    await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
    await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));

    logger.info({ relPath, chunks: toIngest.length, totalChunks }, "Ingested file");

    if (limit > 0 && totalChunks >= limit) break;
  }

  logger.info({ totalChunks, filesProcessed }, "✅ Tanakh commentaries ingestion complete.");
}
