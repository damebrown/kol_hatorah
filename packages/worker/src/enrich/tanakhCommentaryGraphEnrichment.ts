import pLimit from "p-limit";
import { createQdrantClient, getConfig, type Logger } from "@kol-hatorah/core";
import { getSQLiteManager } from "../storage/sqlite";
import { ALLOWLISTED_COMMENTARY_WORK_SQL } from "../storage/sqlite/queries";
import {
  baseBookTitleFromCommentaryWork,
  isAllowlistedTanakhCommentaryWork,
  tanakhCommentatorKeyFromWork,
} from "../ingest/tanakhCommentaryAllowlist";
import { resolveValidatedTanakhBaseRef } from "./commentaryBaseRef";
import { normalizeLinksPayload, stripRefNoise } from "./sefariaClient";
import { SefariaGraphClient } from "../rag/sefariaGraphClient";
import type { SefariaLinkRow } from "../ingest/bavli/sefariaApi";
import type { RefTopicLinkRow } from "../rag/sefariaGraphClient";
import type { TanakhCommentaryGraphUpdate } from "../storage/sqlite/types";

/** Max topic slugs stored per commentary chunk (base-ref ref-topic-links). */
export const MAX_GRAPH_TOPICS_PER_CHUNK = 24;

/** Max outbound link targets stored per chunk (base-ref /api/links). */
export const MAX_GRAPH_LINKED_REFS_PER_CHUNK = 32;

/** Sefaria links/ref-topic-links can be slow; short timeouts produce noisy aborts and empty graph fields. */
const SEFARIA_GRAPH_HTTP_TIMEOUT_MS = 35_000;

/** Whole-row budget: base-ref validation (several /api/texts tries) + graph fetches. */
const ROW_ENRICH_ABORT_MS = 120_000;

const QDRANT_SCROLL_PAGE = 500;

export interface RunTanakhCommentaryGraphEnrichmentOpts {
  /** Remove non-allowlisted `tanakh_commentary` rows from SQLite (+ ref_links / FTS) and matching Qdrant points. */
  reduceCorpus: boolean;
  limit: number;
  dryRun: boolean;
  resume: boolean;
  batchSize: number;
  concurrency: number;
  doQdrant: boolean;
  logger: Logger;
}

function topicSlugFromRow(row: RefTopicLinkRow & { topic?: unknown }): string | null {
  const t = row.topic;
  if (typeof t === "string" && t.length) return t;
  if (t && typeof t === "object" && t !== null && "slug" in t && typeof (t as { slug?: unknown }).slug === "string") {
    const s = (t as { slug: string }).slug;
    return s.length ? s : null;
  }
  return null;
}

function compactTopics(rows: RefTopicLinkRow[]): { topics: string[]; linkTypes: string[] } {
  const topics: string[] = [];
  const linkTypes: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const slug = topicSlugFromRow(r as RefTopicLinkRow & { topic?: unknown });
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    topics.push(slug);
    linkTypes.push(typeof r.linkType === "string" ? r.linkType : "");
    if (topics.length >= MAX_GRAPH_TOPICS_PER_CHUNK) break;
  }
  return { topics, linkTypes };
}

function compactLinks(fromBaseRef: string, rows: SefariaLinkRow[]): { refs: string[]; types: string[] } {
  const normalized = normalizeLinksPayload(fromBaseRef, rows as unknown[]);
  const refs: string[] = [];
  const types: string[] = [];
  const seen = new Set<string>();
  for (const l of normalized) {
    const to = stripRefNoise(l.toRef);
    if (!to || seen.has(to)) continue;
    seen.add(to);
    refs.push(to);
    const lt = l.linkType ?? l.category ?? "";
    types.push(typeof lt === "string" ? lt : "");
    if (refs.length >= MAX_GRAPH_LINKED_REFS_PER_CHUNK) break;
  }
  return { refs, types };
}

async function pruneQdrantDisallowedCommentary(logger: Logger): Promise<number> {
  const config = getConfig();
  const client = createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey, timeout: 120000 });
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  const idsToDelete: (string | number)[] = [];
  let nextOffset: string | number | Record<string, unknown> | null = null;
  try {
    do {
      const res = await client.scroll(collectionName, {
        filter: { must: [{ key: "type", match: { value: "tanakh_commentary" } }] },
        limit: QDRANT_SCROLL_PAGE,
        offset: nextOffset ?? undefined,
        with_payload: true,
        with_vector: false,
      });
      for (const p of res.points) {
        const w = (p.payload as { work?: string })?.work;
        if (typeof w === "string" && !isAllowlistedTanakhCommentaryWork(w)) {
          idsToDelete.push(p.id);
        }
      }
      nextOffset = res.next_page_offset ?? null;
    } while (nextOffset);
  } catch (e) {
    logger.warn(
      { err: e instanceof Error ? e.message : String(e) },
      "Qdrant scroll for commentary prune failed; SQLite prune still applied"
    );
    return 0;
  }

  if (idsToDelete.length === 0) return 0;
  const batch = 200;
  for (let i = 0; i < idsToDelete.length; i += batch) {
    const slice = idsToDelete.slice(i, i + batch);
    await client.delete(collectionName, { points: slice, wait: true });
  }
  return idsToDelete.length;
}

export async function runTanakhCommentaryGraphEnrichment(opts: RunTanakhCommentaryGraphEnrichmentOpts): Promise<void> {
  const sqlite = await getSQLiteManager();
  const graphLogger: { warn: (o: Record<string, unknown>, m?: string) => void } = {
    warn: (o, m) => opts.logger.warn(o, m ?? ""),
  };
  const graphClient = new SefariaGraphClient(graphLogger, SEFARIA_GRAPH_HTTP_TIMEOUT_MS);

  const countAllCommentary = sqlite.db.prepare(`SELECT COUNT(*) AS c FROM segments WHERE type = 'tanakh_commentary'`);
  const countAllowlisted = sqlite.db.prepare(
    `SELECT COUNT(*) AS c FROM segments WHERE type = 'tanakh_commentary' AND ${ALLOWLISTED_COMMENTARY_WORK_SQL}`
  );
  const totalCommentaryBefore = Number((countAllCommentary.get() as { c: number }).c ?? 0);

  let sqlitePruned = 0;
  let qdrantPruned = 0;

  if (opts.reduceCorpus && !opts.dryRun) {
    sqlitePruned = sqlite.pruneTanakhCommentaryDisallowed().deletedSegments;
    if (opts.doQdrant) {
      qdrantPruned = await pruneQdrantDisallowedCommentary(opts.logger);
    }
  } else if (opts.reduceCorpus && opts.dryRun) {
    const disallowed = sqlite.db
      .prepare(
        `SELECT COUNT(*) AS c FROM segments WHERE type = 'tanakh_commentary' AND NOT ${ALLOWLISTED_COMMENTARY_WORK_SQL}`
      )
      .get() as { c: number };
    sqlitePruned = Number(disallowed.c);
    opts.logger.info({ wouldDeleteSqlite: sqlitePruned }, "Dry-run: commentary rows not matching allowlist (SQLite)");
  }

  const totalCommentaryAfterReduce = Number((countAllCommentary.get() as { c: number }).c ?? 0);
  const allowlistedCommentaryRows = Number((countAllowlisted.get() as { c: number }).c ?? 0);

  let afterRowid = 0;
  let rowsSeen = 0;
  let enrichedOk = 0;
  let skippedBaseRef = 0;
  let sefariaFailures = 0;
  let batchIndex = 0;
  const plimit = pLimit(Math.max(1, opts.concurrency));
  const nowIso = () => new Date().toISOString();

  try {
    while (true) {
      const remaining = opts.limit > 0 ? opts.limit - rowsSeen : opts.batchSize;
      if (opts.limit > 0 && remaining <= 0) break;

      const take = opts.limit > 0 ? Math.min(opts.batchSize, remaining) : opts.batchSize;
      const batch = sqlite.listTanakhCommentaryGraphEnrichment({
        resumeOnly: opts.resume,
        afterRowid,
        limit: take,
      });
      if (!batch.length) break;

      afterRowid = Math.max(...batch.map((r) => r.rowid));
      batchIndex += 1;

      const updates: TanakhCommentaryGraphUpdate[] = [];

      const fetched = await Promise.all(
        batch.map((row) =>
          plimit(async () => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), ROW_ENRICH_ABORT_MS);
            const key = tanakhCommentatorKeyFromWork(row.work);
            const baseBook = baseBookTitleFromCommentaryWork(row.work);
            if (!baseBook) {
              clearTimeout(t);
              return {
                row,
                key,
                update: {
                  id: row.id,
                  graphBaseRef: null,
                  graphBaseNormRef: null,
                  graphTopicsJson: null,
                  graphLinkedRefsJson: null,
                  graphLinkTypesJson: null,
                  graphEnrichedAt: nowIso(),
                  tanakhCommentatorKey: key,
                } satisfies TanakhCommentaryGraphUpdate,
                kind: "skip" as const,
              };
            }

            try {
              const resolved = await resolveValidatedTanakhBaseRef(
                row.work,
                row.ref,
                baseBook,
                opts.logger,
                ctrl.signal
              );
              if (!resolved) {
                return {
                  row,
                  key,
                  update: {
                    id: row.id,
                    graphBaseRef: null,
                    graphBaseNormRef: null,
                    graphTopicsJson: null,
                    graphLinkedRefsJson: null,
                    graphLinkTypesJson: null,
                    graphEnrichedAt: nowIso(),
                    tanakhCommentatorKey: key,
                  } satisfies TanakhCommentaryGraphUpdate,
                  kind: "skip" as const,
                };
              }

              const [topicRows, linkRows] = await Promise.all([
                graphClient.getRefTopicLinksForRef(resolved.baseRef),
                graphClient.getLinksForRef(resolved.baseRef),
              ]);

              const { topics, linkTypes: topicLinkTypes } = compactTopics(topicRows);
              const { refs: linkedRefs, types: linkTypes } = compactLinks(resolved.baseRef, linkRows);

              const topicsPayload =
                topics.length || topicLinkTypes.some(Boolean)
                  ? JSON.stringify(
                      topics.map((slug, i) => ({
                        topic: slug,
                        linkType: topicLinkTypes[i] || undefined,
                      }))
                    )
                  : null;
              const linksPayload = linkedRefs.length ? JSON.stringify(linkedRefs) : null;
              const linkTypesPayload = linkTypes.some(Boolean) ? JSON.stringify(linkTypes) : null;

              return {
                row,
                key,
                update: {
                  id: row.id,
                  graphBaseRef: resolved.baseRef,
                  graphBaseNormRef: resolved.baseNormRef,
                  graphTopicsJson: topicsPayload,
                  graphLinkedRefsJson: linksPayload,
                  graphLinkTypesJson: linkTypesPayload,
                  graphEnrichedAt: nowIso(),
                  tanakhCommentatorKey: key,
                } satisfies TanakhCommentaryGraphUpdate,
                kind: "ok" as const,
              };
            } catch (e) {
              opts.logger.warn(
                { id: row.id, ref: row.ref, err: e instanceof Error ? e.message : String(e) },
                "Graph enrichment: Sefaria error; marking row processed without graph fields"
              );
              return {
                row,
                key,
                update: {
                  id: row.id,
                  graphBaseRef: null,
                  graphBaseNormRef: null,
                  graphTopicsJson: null,
                  graphLinkedRefsJson: null,
                  graphLinkTypesJson: null,
                  graphEnrichedAt: nowIso(),
                  tanakhCommentatorKey: key,
                } satisfies TanakhCommentaryGraphUpdate,
                kind: "fail" as const,
              };
            } finally {
              clearTimeout(t);
            }
          })
        )
      );

      for (const f of fetched) {
        rowsSeen += 1;
        if (f.kind === "ok") enrichedOk += 1;
        else if (f.kind === "skip") skippedBaseRef += 1;
        else sefariaFailures += 1;
        updates.push(f.update);
      }

      if (!opts.dryRun && updates.length) {
        sqlite.applyTanakhCommentaryGraphBatch(updates);
      }

      opts.logger.info(
        {
          batch: batchIndex,
          batchRows: batch.length,
          rowsSeen,
          committed: opts.dryRun ? 0 : updates.length,
        },
        "Tanakh commentary graph enrichment batch done"
      );
    }

    opts.logger.info(
      {
        totalTanakhCommentaryRowsBeforeReduce: totalCommentaryBefore,
        sqliteRowsDeletedByReduce: opts.reduceCorpus && !opts.dryRun ? sqlitePruned : 0,
        sqliteRowsWouldDeleteDryRun: opts.reduceCorpus && opts.dryRun ? sqlitePruned : 0,
        qdrantPointsDeletedByReduce: opts.reduceCorpus && !opts.dryRun && opts.doQdrant ? qdrantPruned : 0,
        totalTanakhCommentaryRowsInSqliteAfterReduce: totalCommentaryAfterReduce,
        allowlistedCommentaryRowsEligibleForEnrichment: allowlistedCommentaryRows,
        enrichmentRowsScannedThisRun: rowsSeen,
        enrichedSuccessfullyWithBaseGraph: enrichedOk,
        skippedProcessedWithoutBaseRef: skippedBaseRef,
        sefariaFetchFailuresOrAborts: sefariaFailures,
        dryRun: opts.dryRun,
        resume: opts.resume,
        reduceCorpus: opts.reduceCorpus,
      },
      "Tanakh commentary reduce + graph enrichment finished"
    );
  } finally {
    sqlite.close();
  }
}
