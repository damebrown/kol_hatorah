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
import { findHebrewMergedFile, WorkTarget } from "../sefariaLoader";
import { getSQLiteManager } from "../storage/sqlite";
import { loadBavliLeavesFromMergedText, resolveBavliRefContext } from "./bavli/loadMergedLeaves";
import { parseSegmentRefParts } from "./bavli/refs";
import { fetchFirstAvailableSectionRef, fetchWorkIndexSubset } from "./bavli/sefariaApi";
import { enrichSefariaMergedSegment } from "./enrichSefariaMergedSegment";

export const BAVLI_CORE_TRACTATES = [
  "Berakhot",
  "Shabbat",
  "Pesachim",
  "Yoma",
  "Megillah",
  "Yevamot",
  "Sotah",
  "Bava Kamma",
  "Sanhedrin",
  "Menachot",
] as const;

export interface IngestBavliOpts {
  tractates: string[];
  limit?: number;
  reset?: boolean;
  resetWorks?: string[];
  doQdrant?: boolean;
  doSqlite?: boolean;
  loadBatchSize?: number;
  apiConcurrency?: number;
  embedBatchSize?: number;
  qdrantBatchSize?: number;
}

function parseTractatesList(raw: string | string[] | undefined, fallback: string[]): string[] {
  if (raw === undefined || raw === "") return [...fallback];
  const flat = Array.isArray(raw) ? raw.join(",") : String(raw);
  const parts = flat
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 1 && parts[0] === "bavli-core") return [...BAVLI_CORE_TRACTATES];
  return parts;
}

const SEFARIA_BAVLI_CHECKPOINT = ".checkpoints/sefaria-bavli.json";

export async function runIngestBavli(opts: IngestBavliOpts): Promise<void> {
  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured. Cannot ingest Bavli.");
    process.exitCode = 1;
    return;
  }

  const doQdrant = opts.doQdrant !== false;
  const doSqlite = opts.doSqlite !== false;
  const loadBatchSize = opts.loadBatchSize ?? 80;
  const apiConcurrency = opts.apiConcurrency ?? 3;
  const embedBatchSize = opts.embedBatchSize ?? 32;
  const qdrantBatchSize = opts.qdrantBatchSize ?? 32;

  const qdrantClient = doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const checkpointPath = path.join(process.cwd(), SEFARIA_BAVLI_CHECKPOINT);
  let checkpoint: Record<string, boolean> = {};
  if (!opts.reset) {
    try {
      checkpoint = JSON.parse(await fs.readFile(checkpointPath, "utf8"));
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded Bavli checkpoint.");
    } catch {
      logger.info("No Bavli checkpoint found; starting fresh.");
    }
  }

  const sqlite = doSqlite ? await getSQLiteManager() : null;
  let totalSegments = 0;
  const limit = opts.limit && opts.limit > 0 ? opts.limit : 0;

  try {
    for (const work of opts.tractates) {
      if (limit > 0 && totalSegments >= limit) break;
      if (opts.resetWorks?.includes(work)) delete checkpoint[work];
      if (checkpoint[work]) {
        logger.info({ work }, "Skipping tractate (checkpoint).");
        continue;
      }

      const target: WorkTarget = { type: "bavli", work, categoryGuess: "Talmud/Bavli" };
      const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
      if (!findResult.filePath) {
        logger.warn({ work }, "No Hebrew merged.json found for tractate; marking checkpoint.");
        checkpoint[work] = true;
        await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
        await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
        continue;
      }

      let parsed: { text?: unknown; versionTitle?: string; license?: string; attribution?: string; versionSource?: string };
      try {
        parsed = JSON.parse(await fs.readFile(findResult.filePath, "utf8"));
      } catch (e) {
        logger.error({ work, err: String(e) }, "Failed to parse merged.json");
        process.exitCode = 1;
        return;
      }

      let bookRef: string | null = null;
      try {
        bookRef = await fetchFirstAvailableSectionRef(work);
      } catch (e) {
        logger.warn({ work, err: String(e) }, "Could not fetch firstAvailableSectionRef; assuming tractate starts at 2a");
      }
      if (!bookRef) {
        bookRef = `${work} 2a`;
        logger.warn({ work, bookRef }, "Using fallback book ref for daf index mapping");
      }

      let ctx;
      try {
        ctx = resolveBavliRefContext(work, parsed.text, bookRef);
      } catch (e) {
        logger.error({ work, err: String(e) }, "Failed to build ref mapping from export");
        process.exitCode = 1;
        return;
      }

      const leaves = loadBavliLeavesFromMergedText(work, parsed.text, ctx);
      if (!leaves.length) {
        logger.warn({ work }, "No leaves extracted; marking checkpoint.");
        checkpoint[work] = true;
        await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
        await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
        continue;
      }

      logger.info({ work, segments: leaves.length, mergedPath: findResult.filePath }, "Bavli tractate loaded from export");

      if (sqlite) {
        try {
          const idx = await fetchWorkIndexSubset(work);
          if (idx) {
            sqlite.upsertCorpusWork({
              corpus: "bavli",
              work,
              title: idx.title ?? work,
              he_title: idx.heTitle ?? null,
              primary_category: idx.primaryCategory ?? null,
              categories_json: idx.categories?.length ? JSON.stringify(idx.categories) : null,
              section_names_json: idx.sectionNames?.length ? JSON.stringify(idx.sectionNames) : null,
              address_types_json: idx.addressTypes?.length ? JSON.stringify(idx.addressTypes) : null,
              updated_at: new Date().toISOString(),
            });
          } else {
            logger.warn({ work }, "Sefaria index API returned no data; skipping corpus_works row");
          }
        } catch (e) {
          logger.warn({ work, err: String(e) }, "Work index fetch failed; continuing without corpus_works update");
        }
      }

      const limitFn = pLimit(apiConcurrency);
      const allChunks: Chunk[] = [];
      const allEmbeddings: number[][] = [];

      for (let offset = 0; offset < leaves.length; offset += loadBatchSize) {
        if (limit > 0 && totalSegments >= limit) break;
        const batch = leaves.slice(offset, offset + loadBatchSize);
        const capped =
          limit > 0 ? batch.slice(0, Math.max(0, limit - totalSegments)) : batch;
        if (!capped.length) break;

        const enriched = await Promise.all(
          capped.map((leaf) =>
            limitFn(() =>
              enrichSefariaMergedSegment({
                work,
                exportRef: leaf.exportRef,
                text: leaf.text,
                segmentType: "bavli",
                versionTitle: parsed.versionTitle,
                license: parsed.license,
                attribution: parsed.attribution,
                sourceWorkForLinks: work,
                resolveRefParts: (canonicalRef) => {
                  const parts = parseSegmentRefParts(canonicalRef);
                  if (!parts) return null;
                  return {
                    daf: parts.daf,
                    amud: parts.amud,
                    enrichSegment: String(parts.segmentNum),
                  };
                },
                logger,
              }),
            ),
          ),
        );

        if (sqlite) {
          sqlite.insertSegments(enriched.map((e) => e.chunk));
          sqlite.applyEnrichmentBatch(enriched.map((e) => e.enrichment));
        }

        allChunks.push(...enriched.map((e) => e.chunk));

        if (doQdrant && openaiService) {
          const texts = enriched.map((e) => e.chunk.text);
          const emb = await openaiService.embedTexts(texts, { batchSize: embedBatchSize });
          if (emb.length !== enriched.length) {
            logger.error({ work }, "Embedding count mismatch; aborting tractate.");
            process.exitCode = 1;
            return;
          }
          allEmbeddings.push(...emb);
        }

        totalSegments += capped.length;
        logger.info({ work, batchDone: totalSegments, tractateTotal: leaves.length }, "Bavli batch stored");
      }

      if (doQdrant && openaiService && qdrantClient && allChunks.length) {
        const vectorSize = allEmbeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);
        for (let i = 0; i < allChunks.length; i += qdrantBatchSize) {
          const cBatch = allChunks.slice(i, i + qdrantBatchSize);
          const vBatch = allEmbeddings.slice(i, i + qdrantBatchSize);
          await upsertChunksWithVectors(qdrantClient, collectionName, cBatch, vBatch);
        }
        logger.info({ work, qdrantChunks: allChunks.length }, "Qdrant upsert complete for tractate");
      }

      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
      await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
    }
  } finally {
    sqlite?.close();
  }

  logger.info({ totalSegments, tractates: opts.tractates.length }, "Bavli ingestion finished.");
}

export { parseTractatesList };
