/**
 * Ingestion pipeline for Tanakh commentaries from Sefaria export.
 * Scope: Rashi, Ramban, Ibn Ezra, Sforno, Kli Yakar (allowlist in tanakhCommentaryAllowlist.ts).
 *
 * Fixes vs old version:
 *  - Refs now use flattenMergedExportText → proper "Rashi on Genesis 1:1" format, not docId:path
 *  - Segments enriched via enrichSefariaMergedSegment (Sefaria Name API + links), matching Bavli/Corpora
 *  - SQLite opened once per run (not per file)
 *  - Embedding via createEmbeddingService (supports both OpenAI and Cohere)
 *  - Checkpoint uses shared checkpoint.ts helpers
 */

import path from "path";
import fs from "fs/promises";
import pLimit from "p-limit";
import {
  getConfig,
  createLogger,
  createQdrantClient,
  createEmbeddingService,
  ensureCollection,
  upsertChunksWithVectors,
  Chunk,
} from "@kol-hatorah/core";
import { getSQLiteManager } from "../storage/sqlite";
import { flattenMergedExportText } from "../sefariaLoader";
import { enrichSefariaMergedSegment } from "./enrichSefariaMergedSegment";
import { splitOversizedChunks, MAX_EMBED_CHARS } from "./splitOversizedChunks";
import { loadCheckpoint, saveCheckpoint } from "./checkpoint";
import { isAllowlistedTanakhCommentaryWork } from "./tanakhCommentaryAllowlist";
import { fetchWorkIndexSubset } from "./bavli/sefariaApi";

const COMMENTARY_BASE_DIRS = [
  "Rishonim on Tanakh",
  "Acharonim on Tanakh",
  "Modern Commentary on Tanakh",
];

const CHECKPOINT_PATH = ".checkpoints/sefaria-tanakh-commentaries.json";

async function collectMergedJsonFiles(dir: string, base: string, acc: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full).replace(/\\/g, "/");
    if (e.isDirectory()) {
      await collectMergedJsonFiles(full, base, acc);
    } else if (e.name === "merged.json" && rel.endsWith("/Hebrew/merged.json")) {
      acc.push(full);
    }
  }
  return acc;
}

export async function discoverCommentaryFiles(tanakhRoot: string): Promise<string[]> {
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

export async function runIngestTanakhCommentaries(opts: {
  limit?: number;
  reset?: boolean;
  resetPaths?: string[];
  doQdrant?: boolean;
  doSqlite?: boolean;
  loadBatchSize?: number;
  apiConcurrency?: number;
  embedBatchSize?: number;
  qdrantBatchSize?: number;
}): Promise<void> {
  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env.");
    process.exitCode = 1;
    return;
  }

  const doQdrant = opts.doQdrant !== false;
  const doSqlite = opts.doSqlite !== false;
  const loadBatchSize = opts.loadBatchSize ?? 64;
  const apiConcurrency = opts.apiConcurrency ?? 2;
  const embedBatchSize = opts.embedBatchSize ?? 32;
  const qdrantBatchSize = opts.qdrantBatchSize ?? 32;
  const globalLimit = opts.limit && opts.limit > 0 ? opts.limit : 0;

  const tanakhRoot = path.join(config.sefariaExportPath, "json", "Tanakh");
  const allFiles = await discoverCommentaryFiles(tanakhRoot);
  logger.info({ count: allFiles.length }, "Discovered commentary merged.json files");

  let checkpoint = opts.reset ? {} : await loadCheckpoint(CHECKPOINT_PATH);
  if (opts.resetPaths?.length) {
    for (const p of opts.resetPaths) delete checkpoint[p];
  }

  const qdrantClient = doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey })
    : null;
  const embeddingService = doQdrant ? createEmbeddingService(config) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const limitFn = pLimit(apiConcurrency);
  let totalChunks = 0;
  let filesProcessed = 0;
  let limitLeft = globalLimit;

  const sqlite = doSqlite ? await getSQLiteManager() : null;

  try {
    for (const absPath of allFiles) {
      if (globalLimit > 0 && limitLeft <= 0) break;
      if (!opts.reset && checkpoint[absPath]) continue;

      let parsed: { title?: string; language?: string; text?: unknown; versionTitle?: string; license?: string; attribution?: string } | null = null;
      try {
        parsed = JSON.parse(await fs.readFile(absPath, "utf8"));
      } catch (e) {
        logger.warn({ absPath, err: String(e) }, "Failed to read/parse file; skipping");
        checkpoint[absPath] = true;
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
        continue;
      }

      if (!parsed?.text) {
        checkpoint[absPath] = true;
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
        continue;
      }

      const title = typeof parsed.title === "string" ? parsed.title : "";
      if (!title) {
        logger.warn({ absPath }, "merged.json missing title; skipping");
        checkpoint[absPath] = true;
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
        continue;
      }

      if (!isAllowlistedTanakhCommentaryWork(title)) {
        logger.debug({ title, absPath }, "Commentary not in allowlist; skipping");
        checkpoint[absPath] = true;
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
        continue;
      }

      const flat = flattenMergedExportText(title, parsed.text);
      const leaves = flat.filter(x => x.text.trim().length > 0).map(x => ({ exportRef: x.ref, text: x.text }));

      if (!leaves.length) {
        checkpoint[absPath] = true;
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
        continue;
      }

      logger.info({ title, absPath, segments: leaves.length }, "Commentary work loaded from export");

      if (sqlite) {
        try {
          const idx = await fetchWorkIndexSubset(title);
          if (idx) {
            sqlite.upsertCorpusWork({
              corpus: "tanakh_commentary",
              work: title,
              title: idx.title ?? title,
              he_title: idx.heTitle ?? null,
              primary_category: idx.primaryCategory ?? null,
              categories_json: idx.categories?.length ? JSON.stringify(idx.categories) : null,
              section_names_json: idx.sectionNames?.length ? JSON.stringify(idx.sectionNames) : null,
              address_types_json: idx.addressTypes?.length ? JSON.stringify(idx.addressTypes) : null,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          logger.warn({ title, err: String(e) }, "Work index fetch failed; continuing");
        }
      }

      const allChunks: Chunk[] = [];
      const allEmbeddings: number[][] = [];

      for (let offset = 0; offset < leaves.length; offset += loadBatchSize) {
        if (globalLimit > 0 && limitLeft <= 0) break;
        const remain = globalLimit > 0 ? limitLeft : leaves.length;
        const batch = leaves.slice(offset, offset + Math.min(loadBatchSize, remain));
        if (!batch.length) break;

        const enriched = await Promise.all(
          batch.map(leaf =>
            limitFn(() =>
              enrichSefariaMergedSegment({
                work: title,
                exportRef: leaf.exportRef,
                text: leaf.text,
                segmentType: "tanakh_commentary",
                versionTitle: parsed!.versionTitle,
                license: parsed!.license,
                attribution: parsed!.attribution,
                sourceWorkForLinks: title,
                logger,
              })
            )
          )
        );

        const chunks = splitOversizedChunks(enriched.map(e => e.chunk), MAX_EMBED_CHARS, logger);

        if (sqlite) {
          sqlite.insertSegments(chunks);
          sqlite.applyEnrichmentBatch(enriched.map(e => e.enrichment));
        }

        allChunks.push(...chunks);
        if (globalLimit > 0) limitLeft = Math.max(0, limitLeft - batch.length);

        if (doQdrant && embeddingService) {
          const texts = chunks.map(c => c.text);
          const emb = await embeddingService.embedTexts(texts, { inputType: "search_document", batchSize: embedBatchSize });
          if (emb.length !== chunks.length) {
            logger.error({ title, absPath }, "Embedding count mismatch; aborting file");
            process.exitCode = 1;
            return;
          }
          allEmbeddings.push(...emb);
        }

        logger.info({ title, stored: allChunks.length, fileTotal: leaves.length }, "Commentary batch processed");
      }

      if (doQdrant && embeddingService && qdrantClient && allChunks.length && allEmbeddings.length) {
        const vectorSize = allEmbeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);
        for (let i = 0; i < allChunks.length; i += qdrantBatchSize) {
          await upsertChunksWithVectors(qdrantClient, collectionName, allChunks.slice(i, i + qdrantBatchSize), allEmbeddings.slice(i, i + qdrantBatchSize));
        }
        logger.info({ title, qdrantChunks: allChunks.length }, "Qdrant upsert complete");
      }

      totalChunks += allChunks.length;
      filesProcessed += 1;
      checkpoint[absPath] = true;
      await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
      logger.info({ title, chunks: allChunks.length, totalChunks }, "Ingested commentary file");
    }
  } finally {
    sqlite?.close();
  }

  logger.info({ totalChunks, filesProcessed }, "Tanakh commentaries ingestion complete");
}
