import fs from "fs/promises";
import path from "path";
import pLimit from "p-limit";
import {
  Chunk,
  createLogger,
  createQdrantClient,
  ensureCollection,
  getConfig,
  OpenAIService,
  upsertChunksWithVectors,
} from "@kol-hatorah/core";
import { flattenMergedExportText } from "../sefariaLoader";
import { getSQLiteManager } from "../storage/sqlite";
import { enrichSefariaMergedSegment } from "./enrichSefariaMergedSegment";
import { fetchWorkIndexSubset } from "./bavli/sefariaApi";
import { listHebrewMergedJsonUnder, relativePathUnderJson } from "./corpora/discoverMergedFiles";
import { getCorpusSpec, normalizeCorpusId, type CorpusExportSpec } from "./corpora/registry";

const CHECKPOINT_PATH = ".checkpoints/sefaria-corpora.json";

export interface IngestCorporaOpts {
  corpusIds: string[];
  limit?: number;
  reset?: boolean;
  resetCorpus?: string[];
  doQdrant?: boolean;
  doSqlite?: boolean;
  loadBatchSize?: number;
  apiConcurrency?: number;
  embedBatchSize?: number;
  qdrantBatchSize?: number;
}

function checkpointKey(corpusId: string, relPath: string): string {
  return `${corpusId}\t${relPath}`;
}

async function loadLeavesFromMergedFile(
  mergedPath: string,
  logger: ReturnType<typeof createLogger>,
): Promise<{
  title: string;
  versionTitle: string | undefined;
  license: string | undefined;
  attribution: string | undefined;
  leaves: Array<{ exportRef: string; text: string }>;
} | null> {
  let parsed: {
    title?: string;
    language?: string;
    text?: unknown;
    versionTitle?: string;
    license?: string;
    attribution?: string;
  };
  try {
    parsed = JSON.parse(await fs.readFile(mergedPath, "utf8"));
  } catch (e) {
    logger.error({ mergedPath, err: String(e) }, "Failed to parse merged.json");
    return null;
  }
  if (parsed.language && parsed.language !== "he") {
    logger.warn({ mergedPath, language: parsed.language }, "Skipping non-Hebrew merged file");
    return null;
  }
  const title = typeof parsed.title === "string" ? parsed.title : "";
  if (!title) {
    logger.warn({ mergedPath }, "merged.json missing title; skipping");
    return null;
  }
  const text = parsed.text;
  if (text == null) {
    logger.warn({ mergedPath, title }, "merged.json missing text; skipping");
    return null;
  }

  const flat = flattenMergedExportText(title, text);
  const leaves = flat
    .filter((x) => x.text.trim().length > 0)
    .map((x) => ({ exportRef: x.ref, text: x.text }));

  return {
    title,
    versionTitle: parsed.versionTitle,
    license: parsed.license,
    attribution: parsed.attribution,
    leaves,
  };
}

async function ingestOneMergedFile(args: {
  spec: CorpusExportSpec;
  mergedPath: string;
  relPath: string;
  sqlite: NonNullable<Awaited<ReturnType<typeof getSQLiteManager>>>;
  openaiService: OpenAIService | null;
  qdrantClient: ReturnType<typeof createQdrantClient> | null;
  collectionName: string;
  loadBatchSize: number;
  apiConcurrency: number;
  embedBatchSize: number;
  qdrantBatchSize: number;
  doQdrant: boolean;
  limitRemaining: () => number;
  consumeLimit: (n: number) => void;
  logger: ReturnType<typeof createLogger>;
}): Promise<{ segments: number; ok: boolean }> {
  const {
    spec,
    mergedPath,
    relPath,
    sqlite,
    openaiService,
    qdrantClient,
    collectionName,
    loadBatchSize,
    apiConcurrency,
    embedBatchSize,
    qdrantBatchSize,
    doQdrant,
    limitRemaining,
    consumeLimit,
    logger,
  } = args;

  const loaded = await loadLeavesFromMergedFile(mergedPath, logger);
  if (!loaded || !loaded.leaves.length) {
    return { segments: 0, ok: loaded !== null };
  }

  const { title, versionTitle, license, attribution, leaves } = loaded;

  logger.info({ corpus: spec.id, title, relPath, segments: leaves.length, mergedPath }, "Corpus work loaded from export");

  try {
    const idx = await fetchWorkIndexSubset(title);
    if (idx) {
      sqlite.upsertCorpusWork({
        corpus: spec.corpusWorksKey,
        work: title,
        title: idx.title ?? title,
        he_title: idx.heTitle ?? null,
        primary_category: idx.primaryCategory ?? null,
        categories_json: idx.categories?.length ? JSON.stringify(idx.categories) : null,
        section_names_json: idx.sectionNames?.length ? JSON.stringify(idx.sectionNames) : null,
        address_types_json: idx.addressTypes?.length ? JSON.stringify(idx.addressTypes) : null,
        updated_at: new Date().toISOString(),
      });
    } else {
      logger.warn({ title, corpus: spec.id }, "Sefaria index API returned no data; skipping corpus_works row");
    }
  } catch (e) {
    logger.warn({ title, corpus: spec.id, err: String(e) }, "Work index fetch failed; continuing without corpus_works update");
  }

  const limitFn = pLimit(apiConcurrency);
  let stored = 0;
  const allChunks: Chunk[] = [];
  const allEmbeddings: number[][] = [];

  for (let offset = 0; offset < leaves.length; offset += loadBatchSize) {
    const remain = limitRemaining();
    if (remain <= 0) break;
    const batch = leaves.slice(offset, offset + loadBatchSize);
    const capped = remain > 0 ? batch.slice(0, remain) : batch;
    if (!capped.length) break;

    const enriched = await Promise.all(
      capped.map((leaf) =>
        limitFn(() =>
          enrichSefariaMergedSegment({
            work: title,
            exportRef: leaf.exportRef,
            text: leaf.text,
            segmentType: spec.segmentType,
            versionTitle,
            license,
            attribution,
            sourceWorkForLinks: title,
            logger,
          }),
        ),
      ),
    );

    sqlite.insertSegments(enriched.map((e) => e.chunk));
    sqlite.applyEnrichmentBatch(enriched.map((e) => e.enrichment));
    allChunks.push(...enriched.map((e) => e.chunk));
    consumeLimit(capped.length);
    stored += capped.length;

    if (doQdrant && openaiService) {
      const texts = enriched.map((e) => e.chunk.text);
      const emb = await openaiService.embedTexts(texts, { batchSize: embedBatchSize });
      if (emb.length !== enriched.length) {
        logger.error({ title, relPath }, "Embedding count mismatch; aborting file.");
        return { segments: stored, ok: false };
      }
      allEmbeddings.push(...emb);
    }

    logger.info({ corpus: spec.id, title, stored, fileTotal: leaves.length }, "Corpus batch stored");
  }

  if (doQdrant && openaiService && qdrantClient && allChunks.length) {
    const vectorSize = allEmbeddings[0].length;
    await ensureCollection(qdrantClient, collectionName, vectorSize);
    for (let i = 0; i < allChunks.length; i += qdrantBatchSize) {
      const cBatch = allChunks.slice(i, i + qdrantBatchSize);
      const vBatch = allEmbeddings.slice(i, i + qdrantBatchSize);
      await upsertChunksWithVectors(qdrantClient, collectionName, cBatch, vBatch);
    }
    logger.info({ corpus: spec.id, title, qdrantChunks: allChunks.length }, "Qdrant upsert complete for file");
  }

  return { segments: stored, ok: true };
}

export async function runIngestCorpora(opts: IngestCorporaOpts): Promise<void> {
  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured. Cannot ingest corpora.");
    process.exitCode = 1;
    return;
  }

  const exportRoot = config.sefariaExportPath;
  const doQdrant = opts.doQdrant !== false;
  const doSqlite = opts.doSqlite !== false;
  const loadBatchSize = opts.loadBatchSize ?? 64;
  const apiConcurrency = opts.apiConcurrency ?? 2;
  const embedBatchSize = opts.embedBatchSize ?? 32;
  const qdrantBatchSize = opts.qdrantBatchSize ?? 32;
  const globalLimit = opts.limit && opts.limit > 0 ? opts.limit : 0;

  const qdrantClient = doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const checkpointAbs = path.join(process.cwd(), CHECKPOINT_PATH);
  let checkpoint: Record<string, boolean> = {};
  if (!opts.reset) {
    try {
      checkpoint = JSON.parse(await fs.readFile(checkpointAbs, "utf8"));
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded corpora checkpoint.");
    } catch {
      logger.info("No corpora checkpoint found; starting fresh.");
    }
  }

  if (opts.resetCorpus?.length) {
    for (const raw of opts.resetCorpus) {
      const id = normalizeCorpusId(raw);
      const prefix = `${id}\t`;
      for (const k of Object.keys(checkpoint)) {
        if (k.startsWith(prefix)) delete checkpoint[k];
      }
    }
  }

  const sqlite = doSqlite ? await getSQLiteManager() : null;
  let totalSegments = 0;
  let limitLeft = globalLimit;

  const limitRemaining = () => (globalLimit > 0 ? limitLeft : Number.MAX_SAFE_INTEGER);
  const consumeLimit = (n: number) => {
    if (globalLimit > 0) limitLeft = Math.max(0, limitLeft - n);
  };

  try {
    for (const corpusId of opts.corpusIds) {
      const spec = getCorpusSpec(corpusId);
      const mergedPathsUnique = new Map<string, true>();
      for (const root of spec.exportRoots) {
        const absRoot = path.join(exportRoot, "json", ...root.split("/"));
        let files: string[];
        try {
          files = await listHebrewMergedJsonUnder(absRoot);
        } catch (e) {
          logger.warn({ corpus: corpusId, absRoot, err: String(e) }, "Could not scan export root; skipping");
          continue;
        }
        logger.info({ corpus: corpusId, absRoot, mergedJsonFiles: files.length }, "Scanned corpus export root");
        for (const f of files) {
          mergedPathsUnique.set(f, true);
        }
      }

      const mergedPaths = [...mergedPathsUnique.keys()].sort();
      if (!mergedPaths.length) {
        logger.warn(
          { corpus: corpusId, rootsTried: spec.exportRoots },
          "No Hebrew/merged.json files found under any export root for corpus",
        );
        continue;
      }

      let skippedCheckpoint = 0;
      let segmentsThisCorpus = 0;
      for (const mergedPath of mergedPaths) {
        if (globalLimit > 0 && limitLeft <= 0) break;
        const relPath = relativePathUnderJson(exportRoot, mergedPath);
        const ck = checkpointKey(spec.id, relPath);
        if (!opts.reset && checkpoint[ck]) {
          skippedCheckpoint += 1;
          logger.info({ corpus: corpusId, relPath }, "Skipping file (checkpoint)");
          continue;
        }

        if (!sqlite) {
          logger.error("SQLite disabled; corpora ingestion requires SQLite.");
          process.exitCode = 1;
          return;
        }

        const result = await ingestOneMergedFile({
          spec,
          mergedPath,
          relPath,
          sqlite,
          openaiService,
          qdrantClient,
          collectionName,
          loadBatchSize,
          apiConcurrency,
          embedBatchSize,
          qdrantBatchSize,
          doQdrant,
          limitRemaining,
          consumeLimit,
          logger,
        });

        if (!result.ok) {
          process.exitCode = 1;
          return;
        }

        totalSegments += result.segments;
        segmentsThisCorpus += result.segments;
        if (result.ok) {
          checkpoint[ck] = true;
          await fs.mkdir(path.dirname(checkpointAbs), { recursive: true });
          await fs.writeFile(checkpointAbs, JSON.stringify(checkpoint, null, 2));
        }
      }

      if (skippedCheckpoint > 0 && segmentsThisCorpus === 0 && mergedPaths.length > 0) {
        logger.info(
          { corpus: corpusId, skippedCheckpoint, totalFiles: mergedPaths.length },
          "All discovered files were already in checkpoint; use --reset-corpus <id> or --reset to re-ingest",
        );
      }
    }
  } finally {
    sqlite?.close();
  }

  logger.info({ totalSegments, corpora: opts.corpusIds }, "Corpora ingestion finished.");
}
