/**
 * Mishnah → Tanakh Verse Resolution Pipeline
 *
 * ROOT CAUSE + FIX NOTE (for "NONE" in valid cases):
 * 1) Quote window extraction: Previously only took text AFTER the marker. Many citations have the
 *    quote BEFORE "(book chap)" or the text after is boilerplate ("עד שגומר כל הפרשה"). Fix: extract
 *    from both before and after; detect boilerplate; prefer introducer-guided windows.
 * 2) Scoring: Score = shared/quoteTokens. Rejection can be from sharedTokens < MIN_SHARED_TOKENS
 *    even when score >= threshold. Debug now shows explicit decision reason.
 * 3) Fallback: When NONE, we no longer show first verse text (was masking failure).
 *
 * When a new failure happens, check --debug-reflink output:
 *   - quoteWindowRaw: what we extracted
 *   - quoteTokens list: meaningful tokens for matching
 *   - top candidates: sharedTokens, score, passed (✓/✗) and decisionReason
 *   - FALLBACK_USED: if we showed chapter-only with verse text
 */

import { normalizeText } from "@kol-hatorah/core";
import { MISHNAH_PAREN_REFS } from "../config/mishnahParenRefs";
import { extractQuoteWindow } from "./quoteWindow/extractQuoteWindow";
import { normalizeForMatching } from "./quoteWindow/extractQuoteWindow";

export { extractQuoteWindow } from "./quoteWindow/extractQuoteWindow";

const STOPWORDS = new Set([
  "ו", "ה", "ל", "ב", "כ", "מ", "ש", "את", "על", "אל", "מן", "מאת",
  "של", "כי", "אשר", "זה", "זו", "הוא", "היא", "אין", "גם", "עוד", "עם", "בין",
]);

function tokenizeSignificant(s: string): { tokens: Set<string>; ordered: string[] } {
  const preNorm = normalizeForMatching(s);
  const norm = normalizeText(preNorm).textNorm;
  const filtered = norm.split(/\s+/).filter((t) => t.length > 0 && !STOPWORDS.has(t));
  return { tokens: new Set(filtered), ordered: filtered };
}

export interface ResolveVerseDebugInfo {
  quoteWindowRaw: string;
  quoteWindowNorm: string;
  quoteTokens: number;
  quoteTokensList: string[];
  versesFetched: number;
  candidates: Array<{
    refHeb: string;
    verseNum: number;
    verseNormExcerpt: string;
    sharedTokens: number;
    totalQuoteTokens: number;
    score: number;
    contiguousLength: number;
    passed: boolean;
    decisionReason: string;
  }>;
  decision: "CONFIRMED" | "AMBIGUOUS" | "NONE";
  decisionReason: string;
  thresholds: {
    MIN_SHARED_TOKENS: number;
    MIN_SCORE_CONFIRMED: number;
    QUOTE_WINDOW_MIN: number;
    QUOTE_WINDOW_MAX: number;
  };
  fallbackUsed?: boolean;
}

/**
 * Longest contiguous sequence of quote tokens found in verse (order preserved in verse).
 * Uses verse as the "text" and checks how many quote tokens appear consecutively.
 */
function longestContiguousMatch(quoteArr: string[], verseSet: Set<string>): number {
  let max = 0;
  let curr = 0;
  for (const t of quoteArr) {
    if (verseSet.has(t)) {
      curr++;
      max = Math.max(max, curr);
    } else {
      curr = 0;
    }
  }
  return max;
}

/**
 * Score quote window against a Tanakh verse. Returns 0-1.
 * Base: overlap ratio. Bonus: contiguous n-gram (up to CONTIGUOUS_BONUS_MAX).
 */
function scoreOverlap(
  quoteTokens: Set<string>,
  quoteArr: string[],
  verseTokens: Set<string>,
  contiguousBonusMax: number
): { score: number; contiguousLength: number } {
  if (quoteTokens.size === 0) return { score: 0, contiguousLength: 0 };
  let shared = 0;
  for (const t of quoteTokens) {
    if (verseTokens.has(t)) shared++;
  }
  const baseScore = shared / quoteTokens.size;
  const contiguous = longestContiguousMatch(quoteArr, verseTokens);
  const bonus = Math.min(contiguousBonusMax, contiguous * 0.05);
  return { score: Math.min(1, baseScore + bonus), contiguousLength: contiguous };
}

export interface ResolvedVerse {
  verseNum: number;
  ref: string;
  refHeb?: string;
  text: string;
  score: number;
  sharedTokens: number;
}

export interface ResolveVerseResult {
  resolved: ResolvedVerse[];
  debug?: ResolveVerseDebugInfo;
}

function buildDecisionReason(
  sharedTokens: number,
  score: number,
  contiguous: number,
  minShared: number,
  minScore: number,
  quoteTokensSize: number,
  lowThreshold: number,
  minContiguousForLow: number
): string {
  if (sharedTokens < 2) return "REJECTED: sharedTokens<2 (never confirm on 1)";
  if (sharedTokens < minShared) return `REJECTED: sharedTokens(${sharedTokens})<MIN_SHARED_TOKENS(${minShared})`;
  if (score < minScore) return `REJECTED: score(${score.toFixed(2)})<MIN_SCORE(${minScore})`;
  if (quoteTokensSize < lowThreshold && contiguous < minContiguousForLow) {
    return `REJECTED: quoteTokens(${quoteTokensSize})<${lowThreshold} requires contiguous>=${minContiguousForLow}, got ${contiguous}`;
  }
  return "CONFIRMED";
}

/**
 * Resolve chapter-only ref to specific verse(s) by matching quote window.
 * Returns best match if score >= threshold and shared >= min, else [] (use chapter-level).
 */
export function resolveVerseFromChapter(
  quoteWindow: string,
  chapterVerses: Array<{ ref: string; textPlain: string; verseNum?: number }>,
  workCanon: string,
  chapter: number,
  formatRefHeb?: (work: string, ref: string) => string,
  opts?: { collectDebug?: boolean }
): ResolveVerseResult {
  const {
    MIN_SHARED_TOKENS,
    MIN_SCORE_CONFIRMED,
    MAX_AMBIGUOUS_RESULTS,
    DEBUG_TOP_N,
    QUOTE_TOKENS_LOW_THRESHOLD,
    MIN_CONTIGUOUS_FOR_LOW,
    CONTIGUOUS_BONUS_MAX,
  } = MISHNAH_PAREN_REFS;
  const collectDebug = opts?.collectDebug ?? false;

  const { tokens: quoteTokens, ordered: quoteArr } = tokenizeSignificant(quoteWindow);
  const quoteTokensSize = quoteTokens.size;

  const allScored: Array<{
    verseNum: number;
    ref: string;
    refHeb: string;
    textPlain: string;
    score: number;
    sharedTokens: number;
    contiguousLength: number;
    passed: boolean;
    decisionReason: string;
  }> = [];

  for (const row of chapterVerses) {
    const { tokens: verseTokens, ordered: _ } = tokenizeSignificant(row.textPlain || "");
    const { score, contiguousLength } = scoreOverlap(
      quoteTokens,
      quoteArr,
      verseTokens,
      CONTIGUOUS_BONUS_MAX
    );
    const sharedTokens = [...quoteTokens].filter((t) => verseTokens.has(t)).length;

    const lowRequirement = quoteTokensSize < QUOTE_TOKENS_LOW_THRESHOLD &&
      contiguousLength < MIN_CONTIGUOUS_FOR_LOW;

    const decisionReason = buildDecisionReason(
      sharedTokens,
      score,
      contiguousLength,
      MIN_SHARED_TOKENS,
      MIN_SCORE_CONFIRMED,
      quoteTokensSize,
      QUOTE_TOKENS_LOW_THRESHOLD,
      MIN_CONTIGUOUS_FOR_LOW
    );

    const passed = decisionReason === "CONFIRMED";

    const verseNum = row.verseNum ?? parseInt((row.ref || "").split(":")[1] || "0", 10);
    const refHeb = formatRefHeb ? formatRefHeb(workCanon, row.ref || `${chapter}:${verseNum}`) : "";

    allScored.push({
      verseNum,
      ref: row.ref || `${chapter}:${verseNum}`,
      refHeb,
      textPlain: row.textPlain || "",
      score,
      sharedTokens,
      contiguousLength,
      passed,
      decisionReason,
    });
  }

  allScored.sort((a, b) => b.score - a.score || b.sharedTokens - a.sharedTokens);

  const passed = allScored.filter((r) => r.passed);
  const seen = new Set<number>();
  const resolved: ResolvedVerse[] = passed
    .filter((r) => {
      if (seen.has(r.verseNum)) return false;
      seen.add(r.verseNum);
      return true;
    })
    .slice(0, MAX_AMBIGUOUS_RESULTS)
    .map((r) => ({
      verseNum: r.verseNum,
      ref: r.ref,
      refHeb: r.refHeb,
      text: chapterVerses.find((v) => (v.ref || "").includes(`${chapter}:${r.verseNum}`))?.textPlain || "",
      score: r.score,
      sharedTokens: r.sharedTokens,
    }));

  const dedupedByVerse = new Map<number, typeof allScored[0]>();
  for (const r of allScored) {
    if (!dedupedByVerse.has(r.verseNum)) dedupedByVerse.set(r.verseNum, r);
  }
  const topN = [...dedupedByVerse.values()].sort((a, b) => b.score - a.score).slice(0, DEBUG_TOP_N);

  const decision = resolved.length >= 1 ? (resolved.length > 1 ? "AMBIGUOUS" : "CONFIRMED") : "NONE";
  const bestReject = topN.find((r) => !r.passed);
  const decisionReasonStr =
    decision === "NONE" && bestReject
      ? `best candidate: ${bestReject.decisionReason}`
      : decision;

  const thresholds = {
    MIN_SHARED_TOKENS,
    MIN_SCORE_CONFIRMED,
    QUOTE_WINDOW_MIN: MISHNAH_PAREN_REFS.QUOTE_WINDOW_MIN,
    QUOTE_WINDOW_MAX: MISHNAH_PAREN_REFS.QUOTE_WINDOW_MAX,
  };

  if (quoteTokensSize < MIN_SHARED_TOKENS) {
    return {
      resolved: [],
      debug: collectDebug
        ? {
            quoteWindowRaw: quoteWindow,
            quoteWindowNorm: quoteArr.join(" "),
            quoteTokens: quoteTokensSize,
            quoteTokensList: quoteArr,
            versesFetched: chapterVerses.length,
            candidates: [],
            decision: "NONE",
            decisionReason: `quoteTokens(${quoteTokensSize})<MIN_SHARED_TOKENS(${MIN_SHARED_TOKENS})`,
            thresholds,
          }
        : undefined,
    };
  }

  return {
    resolved,
    debug: collectDebug
      ? {
          quoteWindowRaw: quoteWindow,
          quoteWindowNorm: quoteArr.join(" "),
          quoteTokens: quoteTokensSize,
          quoteTokensList: quoteArr,
          versesFetched: chapterVerses.length,
          candidates: topN.map((r) => ({
            refHeb: r.refHeb,
            verseNum: r.verseNum,
            verseNormExcerpt: normalizeForMatching(r.textPlain).slice(0, 120),
            sharedTokens: r.sharedTokens,
            totalQuoteTokens: quoteTokensSize,
            score: r.score,
            contiguousLength: r.contiguousLength,
            passed: r.passed,
            decisionReason: r.decisionReason,
          })),
          decision,
          decisionReason: decisionReasonStr,
          thresholds,
          fallbackUsed: resolved.length === 0 && chapterVerses.length > 0,
        }
      : undefined,
  };
}
