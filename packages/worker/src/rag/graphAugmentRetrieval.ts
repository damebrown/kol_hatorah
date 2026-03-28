import type { Chunk, TextType } from "@kol-hatorah/core";
import type { Logger } from "@kol-hatorah/core";
import type { SefariaLinkRow } from "../ingest/bavli/sefariaApi";
import { SefariaGraphClient, type RefTopicLinkRow } from "./sefariaGraphClient";

/** Max link-neighbor hits counted toward score (stability vs. hub refs). */
const MAX_LINK_SIGNAL = 6;
/** Max summed topic intersections with peers (each pair counts once per direction). */
const MAX_TOPIC_SIGNAL = 12;

/**
 * finalScore =
 *   W_RETRIEVAL * retrievalNorm
 * + W_LINKS * linkSignal
 * + W_TOPICS * topicSignal
 * + W_COMMENTARY * commentaryToStrongerBonus   (0 or 1)
 * - W_WEAK * weakIsolationPenalty              (0 or 1)
 *
 * retrievalNorm = chunk's retrieval score / max score in the pool (if max>0, else 0).
 * linkSignal = min(raw count of Sefaria links whose other end matches some other candidate ref, MAX_LINK_SIGNAL).
 * topicSignal = min(sum over other candidates of |topics(this) ∩ topics(other)|, MAX_TOPIC_SIGNAL).
 * commentaryToStrongerBonus = 1 if this chunk has a commentary-class link to another candidate with strictly higher retrieval score.
 * weakIsolationPenalty = 1 if linkSignal==0 and topicSignal==0 (no graph cohesion in this pool).
 */
const W_RETRIEVAL = 1.0;
const W_LINKS = 0.11;
const W_TOPICS = 0.05;
const W_COMMENTARY = 0.09;
const W_WEAK = 0.06;

/** Expanded chunks use parent input score * this ratio so they rarely outrank strong retrieval hits. */
const EXPANSION_SCORE_RATIO = 0.38;
const TOP_SOURCES_FOR_EXPANSION = 3;
const MAX_LINK_NEIGHBORS_PER_SOURCE = 2;

export interface GraphAugmentSqlite {
  getRef: (normalizedRef: string) =>
    | {
        id: string;
        type: string;
        work: string;
        ref: string;
        normalizedRef: string;
        lang: string;
        source: string;
        textPlain: string;
      }
    | null
    | undefined;
}

export interface GraphAugmentationDebug {
  enabled: true;
  originalTop: Array<{ ref: string; normalizedRef: string; score: number }>;
  signals: Array<{
    ref: string;
    linkSignalRaw: number;
    topicSignalRaw: number;
    commentaryBonus: number;
    weakPenalty: number;
    finalScore: number;
  }>;
  rerankedTop: Array<{ ref: string; graphScore: number; retrievalScore: number }>;
  addedNeighbors: Array<{ fromRef: string; neighborSefariaRef: string; localRef: string; score: number }>;
  unmappedNeighborRefs: string[];
}

function normalizeRefKey(r: string): string {
  return r
    .trim()
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, " ");
}

/** Loose match for Sefaria link endpoints vs. corpus refs (segment granularity). */
export function refsConnect(a: string, b: string): boolean {
  const A = normalizeRefKey(a);
  const B = normalizeRefKey(b);
  if (!A || !B) return false;
  if (A === B) return true;
  if (A.startsWith(B + " ") || A.startsWith(B + ":")) return true;
  if (B.startsWith(A + " ") || B.startsWith(A + ":")) return true;
  return false;
}

function segmentRowToChunk(row: {
  id: string;
  type: string;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: string;
  source: string;
  textPlain: string;
}): Chunk {
  return {
    id: row.id,
    text: row.textPlain,
    source: row.source,
    type: row.type as TextType,
    work: row.work,
    ref: row.ref,
    normalizedRef: row.normalizedRef,
    lang: row.lang as "he" | "en",
    createdAt: "1970-01-01T00:00:00.000Z",
  };
}

/**
 * Map a Sefaria neighbor ref to one local segment row.
 * Rule when several DB variants could match: try ordered variants; first getRef hit wins (deterministic).
 */
export function mapSefariaRefToLocal(
  sqlite: GraphAugmentSqlite,
  sefariaRef: string
): {
  row: NonNullable<ReturnType<GraphAugmentSqlite["getRef"]>> | null;
  tried: string[];
} {
  const raw = sefariaRef.trim();
  const variants: string[] = [];
  const add = (s: string) => {
    const v = s.trim();
    if (v && !variants.includes(v)) variants.push(v);
  };
  add(raw);
  add(raw.replace(/\./g, " "));
  add(raw.replace(/\./g, " ").replace(/\s+/g, " "));

  for (const v of variants) {
    const row = sqlite.getRef(v);
    if (row) return { row, tried: variants };
  }
  return { row: null, tried: variants };
}

function otherLinkEndpoint(link: SefariaLinkRow, fromDisplayRef: string): string | null {
  const fromKey = normalizeRefKey(fromDisplayRef);
  const candidates = [link.ref, link.sourceRef, link.anchorRef].filter(
    (x): x is string => typeof x === "string" && x.length > 0
  );
  for (const c of candidates) {
    if (normalizeRefKey(c) !== fromKey) return c;
  }
  return null;
}

function topicSlugs(rows: RefTopicLinkRow[]): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    if (typeof r.topic === "string" && r.topic.length) s.add(r.topic);
  }
  return s;
}

function isCommentaryLink(link: SefariaLinkRow): boolean {
  const c = (link.category || "").toLowerCase();
  const t = (link.type || "").toLowerCase();
  return c.includes("commentary") || t.includes("commentary");
}

function expansionLinkPriority(link: SefariaLinkRow): number {
  const c = (link.category || "").toLowerCase();
  const t = (link.type || "").toLowerCase();
  if (t.includes("commentary") || c.includes("commentary")) return 0;
  if (c.includes("quoting")) return 1;
  if (t.includes("quotation") || c.includes("midrash")) return 2;
  return 3;
}

function displayRefForApi(chunk: Chunk): string {
  return (chunk.sefariaCanonicalRef || chunk.normalizedRef || chunk.ref).trim();
}

export interface GraphAugmentResult {
  chunks: Chunk[];
  scores: number[];
  debug: GraphAugmentationDebug | null;
}

function capMergedByUnitsAndChars(
  merged: { chunk: Chunk; sortKey: number; promptScore: number }[],
  maxUnits: number,
  maxChars: number
): { chunk: Chunk; sortKey: number; promptScore: number }[] {
  const byUnits = merged.slice(0, maxUnits);
  let totalChars = 0;
  const out: { chunk: Chunk; sortKey: number; promptScore: number }[] = [];
  for (const item of byUnits) {
    if (totalChars + item.chunk.text.length > maxChars) {
      const remaining = maxChars - totalChars;
      if (remaining <= 0) break;
      out.push({
        chunk: { ...item.chunk, text: item.chunk.text.slice(0, remaining) },
        sortKey: item.sortKey,
        promptScore: item.promptScore,
      });
      break;
    }
    out.push(item);
    totalChars += item.chunk.text.length;
  }
  return out;
}

/**
 * Post-retrieval graph layer: rerank with Sefaria links + ref-topic-links, then 1-hop conservative expansion.
 * Best-effort only; never throws.
 */
export async function graphAugmentRetrieval(
  chunks: Chunk[],
  scores: number[],
  sqlite: GraphAugmentSqlite,
  logger: Logger,
  client: SefariaGraphClient,
  opts?: { maxUnits?: number; maxChars?: number }
): Promise<GraphAugmentResult> {
  const maxUnits = opts?.maxUnits ?? 8;
  const maxChars = opts?.maxChars ?? 30_000;
  const debug: GraphAugmentationDebug = {
    enabled: true,
    originalTop: chunks.map((c, i) => ({
      ref: c.ref,
      normalizedRef: c.normalizedRef,
      score: scores[i] ?? 0,
    })),
    signals: [],
    rerankedTop: [],
    addedNeighbors: [],
    unmappedNeighborRefs: [],
  };

  if (chunks.length === 0) {
    return { chunks, scores, debug: null };
  }

  const maxScore = Math.max(...scores, 1e-9);
  const n = chunks.length;

  const linksByIndex: SefariaLinkRow[][] = [];
  const topicsByIndex: RefTopicLinkRow[][] = [];

  try {
    for (let i = 0; i < n; i++) {
      const dref = displayRefForApi(chunks[i]!);
      const [links, topics] = await Promise.all([
        client.getLinksForRef(dref),
        client.getRefTopicLinksForRef(dref),
      ]);
      linksByIndex.push(links);
      topicsByIndex.push(topics);
    }
  } catch (e) {
    logger.warn({ err: String(e) }, "graphAugmentRetrieval: unexpected error prefetching Sefaria; skipping graph layer");
    return { chunks, scores, debug: null };
  }

  const topicSets = topicsByIndex.map((rows) => topicSlugs(rows));

  const linkSignalRaw = new Array<number>(n).fill(0);
  const topicSignalRaw = new Array<number>(n).fill(0);
  const commentaryBonus = new Array<number>(n).fill(0);

  for (let i = 0; i < n; i++) {
    const di = displayRefForApi(chunks[i]!);
    for (const L of linksByIndex[i] || []) {
      const other = otherLinkEndpoint(L, di);
      if (!other) continue;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dj = displayRefForApi(chunks[j]!);
        if (refsConnect(other, dj)) {
          linkSignalRaw[i]!++;
          break;
        }
      }
    }
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let inter = 0;
      for (const t of topicSets[i] || []) {
        if (topicSets[j]!.has(t)) inter++;
      }
      topicSignalRaw[i]! += inter;
    }
  }

  for (let i = 0; i < n; i++) {
    const di = displayRefForApi(chunks[i]!);
    const si = scores[i] ?? 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const sj = scores[j] ?? 0;
      if (sj <= si) continue;
      const dj = displayRefForApi(chunks[j]!);
      for (const L of linksByIndex[i] || []) {
        if (!isCommentaryLink(L)) continue;
        const other = otherLinkEndpoint(L, di);
        if (other && refsConnect(other, dj)) {
          commentaryBonus[i] = 1;
          break;
        }
      }
      if (commentaryBonus[i]) break;
    }
  }

  const finalScores: number[] = [];
  for (let i = 0; i < n; i++) {
    const retrievalNorm = (scores[i] ?? 0) / maxScore;
    const ls = Math.min(linkSignalRaw[i]!, MAX_LINK_SIGNAL);
    const ts = Math.min(topicSignalRaw[i]!, MAX_TOPIC_SIGNAL);
    const weak = ls === 0 && ts === 0 ? 1 : 0;
    const fs =
      W_RETRIEVAL * retrievalNorm +
      W_LINKS * ls +
      W_TOPICS * ts +
      W_COMMENTARY * (commentaryBonus[i] || 0) -
      W_WEAK * weak;
    finalScores.push(fs);
    debug.signals.push({
      ref: chunks[i]!.ref,
      linkSignalRaw: linkSignalRaw[i]!,
      topicSignalRaw: topicSignalRaw[i]!,
      commentaryBonus: commentaryBonus[i] || 0,
      weakPenalty: weak,
      finalScore: fs,
    });
  }

  const order = finalScores.map((_, i) => i).sort((a, b) => finalScores[b]! - finalScores[a]!);

  const rerankedChunks: Chunk[] = order.map((i) => chunks[i]!);
  const minOrigGraphScore = Math.min(...finalScores);

  debug.rerankedTop = order.map((origIdx) => ({
    ref: chunks[origIdx]!.ref,
    graphScore: finalScores[origIdx]!,
    retrievalScore: scores[origIdx] ?? 0,
  }));

  const seenNorm = new Set(rerankedChunks.map((c) => c.normalizedRef));
  const added: Array<{ chunk: Chunk; sortKey: number; promptScore: number }> = [];

  for (let ord = 0; ord < TOP_SOURCES_FOR_EXPANSION && ord < n; ord++) {
    const idx = ord;
    const parentChunk = chunks[idx]!;
    const parentInputScore = scores[idx] ?? 0;
    const di = displayRefForApi(parentChunk);
    const links = linksByIndex[idx] || [];
    const sortedLinks = [...links].sort((a, b) => expansionLinkPriority(a) - expansionLinkPriority(b));

    let taken = 0;
    for (const L of sortedLinks) {
      if (taken >= MAX_LINK_NEIGHBORS_PER_SOURCE) break;
      const neighbor = otherLinkEndpoint(L, di);
      if (!neighbor) continue;
      const mapped = mapSefariaRefToLocal(sqlite, neighbor);
      if (!mapped.row) {
        debug.unmappedNeighborRefs.push(neighbor);
        logger.warn(
          { sefariaRef: neighbor, triedVariants: mapped.tried },
          "graphAugment: neighbor ref not mapped to local segment"
        );
        continue;
      }
      const row = mapped.row;
      if (seenNorm.has(row.normalizedRef)) continue;

      const ch = segmentRowToChunk(row);
      const expScore = parentInputScore * EXPANSION_SCORE_RATIO;
      const sortKey = Math.min(expScore, minOrigGraphScore - 1e-6);
      seenNorm.add(row.normalizedRef);
      added.push({ chunk: ch, sortKey, promptScore: expScore });
      debug.addedNeighbors.push({
        fromRef: parentChunk.ref,
        neighborSefariaRef: neighbor,
        localRef: row.ref,
        score: expScore,
      });
      taken++;
    }
  }

  let merged: { chunk: Chunk; sortKey: number; promptScore: number }[] = [
    ...order.map((origIdx) => ({
      chunk: chunks[origIdx]!,
      sortKey: finalScores[origIdx]!,
      promptScore: scores[origIdx] ?? 0,
    })),
    ...added,
  ];
  merged.sort((a, b) => b.sortKey - a.sortKey);
  merged = capMergedByUnitsAndChars(merged, maxUnits, maxChars);

  return {
    chunks: merged.map((m) => m.chunk),
    scores: merged.map((m) => m.promptScore),
    debug,
  };
}
