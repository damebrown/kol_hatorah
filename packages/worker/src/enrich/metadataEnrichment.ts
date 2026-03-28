import pLimit from "p-limit";
import { createQdrantClient, getConfig, mergePayloadFieldsForPoints } from "@kol-hatorah/core";
import type { Logger } from "@kol-hatorah/core";
import type { RefLinkRow, SegmentEnrichmentUpdate } from "../storage/sqlite/types";
import { getSQLiteManager } from "../storage/sqlite";
import {
  fetchSefariaLinks,
  fetchSefariaTextsMeta,
  refLinkRowId,
  type NormalizedLink,
  type SefariaTextMeta,
} from "./sefariaClient";

export interface RunMetadataEnrichmentOpts {
  corpora: "tanakh" | "mishnah" | "all";
  limit: number;
  dryRun: boolean;
  resume: boolean;
  batchSize: number;
  concurrency: number;
  doQdrant: boolean;
  logger: Logger;
}

function typesForCorpora(c: RunMetadataEnrichmentOpts["corpora"]): string[] {
  if (c === "all") return ["tanakh", "mishnah"];
  if (c === "tanakh") return ["tanakh"];
  if (c === "mishnah") return ["mishnah"];
  return [];
}

function buildQdrantPayloadFields(
  update: SegmentEnrichmentUpdate,
  categories: string[],
  sectionNames: string[]
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  if (update.sefariaUrl) fields.sefariaUrl = update.sefariaUrl;
  if (update.heRef) fields.heRef = update.heRef;
  if (update.primaryCategory) fields.primaryCategory = update.primaryCategory;
  if (categories.length) fields.categories = categories;
  if (sectionNames.length) fields.sectionNames = sectionNames;
  if (update.daf) fields.daf = update.daf;
  if (update.amud) fields.amud = update.amud;
  if (update.enrichSegment) fields.segment = update.enrichSegment;
  fields.hasLinks = update.hasLinks === 1;
  fields.linksCount = update.linksCount;
  if (update.sefariaCanonicalRef) fields.sefariaCanonicalRef = update.sefariaCanonicalRef;
  if (update.sefariaNormalizedRef) fields.sefariaNormalizedRef = update.sefariaNormalizedRef;
  return fields;
}

function toDbPayload(meta: SefariaTextMeta, row: { id: string; ref: string }, linksCount: number, now: string) {
  const update: SegmentEnrichmentUpdate = {
    id: row.id,
    enrichedAt: now,
    sefariaCanonicalRef: meta.canonicalRef,
    sefariaNormalizedRef: meta.sefariaNormalizedRef,
    heRef: meta.heRef,
    sefariaUrl: meta.sefariaUrl,
    primaryCategory: meta.primaryCategory,
    categoriesJson: meta.categories.length ? JSON.stringify(meta.categories) : null,
    sectionNamesJson: meta.sectionNames.length ? JSON.stringify(meta.sectionNames) : null,
    daf: meta.daf,
    amud: meta.amud,
    enrichSegment: meta.segment,
    hasLinks: linksCount > 0 ? 1 : 0,
    linksCount,
  };
  return update;
}

function toRefLinkRows(segmentId: string, fromRef: string, linkList: NormalizedLink[], sourceWork: string): RefLinkRow[] {
  return linkList.map((l) => ({
    id: refLinkRowId({
      segmentId,
      toRef: l.toRef,
      category: l.category ?? "",
      anchorRef: l.anchorRef ?? "",
      linkType: l.linkType ?? "",
    }),
    segment_id: segmentId,
    from_ref: fromRef,
    to_ref: l.toRef,
    category: l.category,
    link_type: l.linkType,
    anchor_ref: l.anchorRef,
    source_work: sourceWork,
  }));
}

export async function runMetadataEnrichment(opts: RunMetadataEnrichmentOpts): Promise<void> {
  const types = typesForCorpora(opts.corpora);
  if (types.length === 0) {
    opts.logger.error({ corpora: opts.corpora }, "Invalid corpora");
    return;
  }

  const config = getConfig();
  const sqlite = await getSQLiteManager();
  const qClient = opts.doQdrant
    ? createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey, timeout: 120000 })
    : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const poolMatchingTotal = sqlite.countSegmentsForEnrichment({
    types,
    resumeOnly: opts.resume,
  });
  const limit = opts.limit > 0 ? opts.limit : 0;
  const rowsPlannedForRun = limit > 0 ? Math.min(poolMatchingTotal, limit) : poolMatchingTotal;
  const batchesEstimated =
    rowsPlannedForRun > 0 ? Math.ceil(rowsPlannedForRun / opts.batchSize) : 0;

  opts.logger.info(
    {
      poolMatchingTotal,
      rowsPlannedForRun,
      batchesEstimated,
      batchSize: opts.batchSize,
      limit: limit || null,
      resume: opts.resume,
      corpora: opts.corpora,
      types,
    },
    "Enrichment run plan (row scan progress uses rowsPlannedForRun)"
  );

  let afterRowid = 0;
  let rowsScanned = 0;
  let rowsEnriched = 0;
  let apiFailures = 0;
  let qdrantSkippedMissing = 0;
  let batchIndex = 0;
  const plimit = pLimit(Math.max(1, opts.concurrency));

  try {
    while (true) {
      const remaining = limit > 0 ? limit - rowsScanned : opts.batchSize;
      if (limit > 0 && remaining <= 0) break;

      const take = limit > 0 ? Math.min(opts.batchSize, remaining) : opts.batchSize;
      const batch = sqlite.listSegmentsForEnrichment({
        types,
        resumeOnly: opts.resume,
        afterRowid,
        limit: take,
      });

      if (!batch.length) break;

      afterRowid = Math.max(...batch.map((r) => r.rowid));
      batchIndex += 1;

      const progressPctBefore =
        rowsPlannedForRun > 0 ? Math.min(100, Math.round((rowsScanned / rowsPlannedForRun) * 100)) : 0;

      opts.logger.info(
        {
          batch: batchIndex,
          batchesEstimated,
          batchRows: batch.length,
          afterRowid,
          types,
          rowsScannedSoFar: rowsScanned,
          rowsPlannedForRun,
          progressPct: progressPctBefore,
        },
        "Enrichment batch: fetching Sefaria metadata"
      );

      const enrichedAt = new Date().toISOString();

      const fetched = await Promise.all(
        batch.map((row) =>
          plimit(async () => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 30000);
            try {
              const tr = await fetchSefariaTextsMeta(
                { ref: row.ref, work: row.work, type: row.type },
                ctrl.signal
              );
              let links: NormalizedLink[] = [];
              if (tr) {
                const linkRef = tr.meta.canonicalRef || tr.refUsed;
                links = await fetchSefariaLinks(linkRef, ctrl.signal);
              }
              return { row, meta: tr?.meta ?? null, links };
            } finally {
              clearTimeout(t);
            }
          })
        )
      );

      rowsScanned += batch.length;

      const progressPctAfter =
        rowsPlannedForRun > 0 ? Math.min(100, Math.round((rowsScanned / rowsPlannedForRun) * 100)) : 0;

      const dbItems: Array<{ update: SegmentEnrichmentUpdate; links: RefLinkRow[] }> = [];
      const qUpdates: Array<{ id: string; fields: Record<string, unknown> }> = [];

      for (const f of fetched) {
        if (!f.meta) {
          apiFailures += 1;
          opts.logger.warn(
            { id: f.row.id, ref: f.row.ref, work: f.row.work },
            "Sefaria texts API returned no metadata; skipping row"
          );
          continue;
        }

        const update = toDbPayload(f.meta, f.row, f.links.length, enrichedAt);
        const links = toRefLinkRows(f.row.id, f.row.ref, f.links, f.row.work);
        dbItems.push({ update, links });
        rowsEnriched += 1;

        const categories = f.meta.categories;
        const sectionNames = f.meta.sectionNames;
        if (opts.doQdrant && qClient) {
          const fields = buildQdrantPayloadFields(
            update,
            categories,
            sectionNames
          );
          qUpdates.push({ id: f.row.id, fields });
        }
      }

      if (!opts.dryRun && dbItems.length) {
        try {
          sqlite.applyEnrichmentBatch(dbItems);
        } catch (e) {
          opts.logger.error({ err: e, batch: batchIndex }, "SQLite enrichment batch failed");
          throw e;
        }
      }

      let qdrantApplied = 0;
      let qdrantSkippedBatch = 0;
      if (!opts.dryRun && opts.doQdrant && qClient && qUpdates.length) {
        try {
          const qRes = await mergePayloadFieldsForPoints(qClient, collectionName, qUpdates, {
            onPointNotFound: ({ id, message }) => {
              opts.logger.warn(
                { id, message },
                "Qdrant: no vector point for segment id; SQLite enrichment still saved"
              );
            },
          });
          qdrantApplied = qRes.applied;
          qdrantSkippedBatch = qRes.skippedPointNotFound;
          qdrantSkippedMissing += qRes.skippedPointNotFound;
        } catch (e) {
          opts.logger.error({ err: e, batch: batchIndex }, "Qdrant payload merge failed");
          throw e;
        }
      }

      opts.logger.info(
        {
          batch: batchIndex,
          batchesEstimated,
          batchRows: batch.length,
          rowsScannedSoFar: rowsScanned,
          rowsPlannedForRun,
          progressPct: progressPctAfter,
          committed: dbItems.length,
          dryRun: opts.dryRun,
          qdrantPoints: opts.dryRun ? 0 : qdrantApplied,
          qdrantSkippedMissingBatch: qdrantSkippedBatch,
        },
        "Enrichment batch complete"
      );
    }

    opts.logger.info(
      {
        rowsScanned,
        rowsPlannedForRun,
        poolMatchingTotal,
        rowsEnriched,
        apiFailures,
        batchesRun: batchIndex,
        qdrantSkippedMissingPoints: qdrantSkippedMissing,
        corpora: opts.corpora,
        resume: opts.resume,
        dryRun: opts.dryRun,
        qdrant: opts.doQdrant,
      },
      "Metadata enrichment finished"
    );
  } finally {
    sqlite.close();
  }
}
