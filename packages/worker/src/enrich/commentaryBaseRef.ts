import type { Logger } from "@kol-hatorah/core";
import {
  fetchSefariaTextsMeta,
  normalizeTanakhRefForSefaria,
  type EnrichmentSegmentRefContext,
} from "./sefariaClient";

const EMPTY_SEGMENT = "<EMPTY_KEY>";

/**
 * Commentary chunks store `ref` as `{docId}:{encodedPath}` (see ingestTanakhCommentaries).
 * Graph enrichment needs the **base Tanakh** Sefaria ref (e.g. `Genesis 1:1`).
 *
 * Deterministic rule:
 * 1. Strip optional ` (part i/n)` suffix from oversized splits.
 * 2. Take path segments after the first `:` (URL-decoded). Skip `<EMPTY_KEY>` placeholders.
 * 3. Collect integer segments in order. If length ≥ 3 and the last segment is in 0–9, drop it
 *    (common sub-commentary index within a verse).
 * 4. Use the last two integers as (chapter, verse) candidates: if either is 0, treat indices as
 *    0-based and use (c+1, v+1); otherwise also try (c, v) as 1-based. Deduplicate and validate
 *    each candidate with Sefaria `/api/texts/` via {@link fetchSefariaTextsMeta} (type `tanakh`).
 *
 * If no candidate validates, return null (caller logs and skips graph fetch).
 */
export function stripCommentaryPartSuffix(ref: string): string {
  return ref.replace(/\s+\(part \d+\/\d+\)\s*$/i, "").trim();
}

export function decodeCommentaryPathSegments(ref: string): string[] | null {
  const r = stripCommentaryPartSuffix(ref);
  const colon = r.indexOf(":");
  if (colon < 0) return null;
  const tail = r.slice(colon + 1).trim();
  if (!tail) return null;
  return tail.split("/").map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  });
}

function integerSegments(segments: string[]): number[] {
  const nums: number[] = [];
  for (const s of segments) {
    if (s === EMPTY_SEGMENT || s === "") continue;
    if (/^-?\d+$/.test(s)) nums.push(parseInt(s, 10));
  }
  return nums;
}

function lastChapterVersePair(nums: number[]): [number, number] | null {
  if (nums.length < 2) return null;
  let n = nums.slice();
  if (n.length >= 3 && n[n.length - 1] >= 0 && n[n.length - 1] <= 9) {
    n = n.slice(0, -1);
  }
  if (n.length < 2) return null;
  return [n[n.length - 2], n[n.length - 1]];
}

function uniquePairs(pairs: Array<[number, number]>): Array<[number, number]> {
  const seen = new Set<string>();
  const out: Array<[number, number]> = [];
  for (const [a, b] of pairs) {
    const k = `${a}:${b}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push([a, b]);
  }
  return out;
}

function chapterVerseDisplayCandidates(a: number, b: number): Array<[number, number]> {
  const raw: Array<[number, number]> = [];
  if (a === 0 || b === 0) raw.push([a + 1, b + 1]);
  raw.push([a, b]);
  raw.push([a + 1, b + 1]);
  return uniquePairs(raw);
}

function refCandidatesForBook(book: string, ch: number, v: number): string[] {
  const base = `${book.trim()} ${ch}:${v}`.replace(/\s+/g, " ").trim();
  const norm = normalizeTanakhRefForSefaria(base);
  return norm ? [norm] : [];
}

export async function resolveValidatedTanakhBaseRef(
  work: string,
  commentaryRef: string,
  baseBook: string,
  logger: Logger,
  signal: AbortSignal
): Promise<{ baseRef: string; baseNormRef: string } | null> {
  const segments = decodeCommentaryPathSegments(commentaryRef);
  if (!segments?.length) {
    logger.warn({ work, commentaryRef }, "Cannot derive base ref: missing encoded path after ':'");
    return null;
  }

  const nums = integerSegments(segments);
  const pair = lastChapterVersePair(nums);
  if (!pair) {
    logger.warn({ work, commentaryRef, segments, nums }, "Cannot derive base ref: not enough numeric indices in path");
    return null;
  }

  const [a, b] = pair;
  const displayPairs = chapterVerseDisplayCandidates(a, b);
  const tried: string[] = [];

  for (const [ch, v] of displayPairs) {
    for (const cand of refCandidatesForBook(baseBook, ch, v)) {
      tried.push(cand);
      const ctx: EnrichmentSegmentRefContext = { ref: cand, work: baseBook, type: "tanakh" };
      const tr = await fetchSefariaTextsMeta(ctx, signal);
      if (tr?.meta?.canonicalRef) {
        const canonical = tr.meta.canonicalRef.trim();
        const norm = (tr.meta.sefariaNormalizedRef || canonical).trim();
        return { baseRef: canonical, baseNormRef: norm };
      }
    }
  }

  logger.warn(
    { work, commentaryRef, baseBook, tried: tried.slice(0, 8), triedCount: tried.length },
    "Cannot derive base ref: no Sefaria texts match for path heuristic"
  );
  return null;
}
