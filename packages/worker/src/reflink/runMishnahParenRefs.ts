import { MishnahParentheticalTanakhRefExtractor } from "./detect/MishnahParentheticalTanakhRefExtractor";
import { linkExplicitTanakhRef } from "./link/linkExplicitTanakhRef";
import { formatMishnahRefHeb, parseChapterVerseFromSegmentRef } from "../planner/utils/formatMishnahRefHeb";
import { formatTanakhRefHeb } from "../planner/utils/formatTanakhRefHeb";
import { sanitizeDisplayText } from "../planner/utils/sanitizeDisplayText";
import { extractQuoteWindow, resolveVerseFromChapter, type ResolveVerseDebugInfo } from "./resolveVerseFromQuote";
import type { PlanResult, QueryPlan } from "../planner/types";
import type { ScopeFilter } from "../storage/sqlite";
import { MISHNAH_PAREN_REFS } from "../config/mishnahParenRefs";
import type { RefCandidate } from "./types/RefCandidate";

const extractor = new MishnahParentheticalTanakhRefExtractor();
const PAGE_SIZE = MISHNAH_PAREN_REFS.SEGMENT_PAGE_SIZE;

export interface MishnahParenRefMatch {
  mishnahRefHeb: string;
  mishnahRef: string;
  mishnahText: string;
  markerText: string;
  tanakhRefsHeb: string[];
  tanakhLinks: Array<{ ref: string; refHeb: string; text?: string }>;
  /** Verse-level ref when resolved; otherwise chapter-only. */
  verseResolved?: boolean;
  /** "לא אותר פסוק מדויק" when chapter-only. */
  verseStatus?: string;
  /** Debug pipeline output when debugReflink is enabled. */
  reflinkDebug?: string;
}

export interface DebugStats {
  totalSegmentsScanned: number;
  totalCandidatesFound: number;
  totalLinksConfirmed: number;
  rawParensSample: string[];
}

export interface RunMishnahParenRefsOpts {
  pagination?: { limit?: number; offset?: number };
  debug?: boolean;
  debugReflink?: boolean;
}

/** Fetch ALL segments in scope by paginating until exhaustion. */
function fetchAllSegments(sqlite: any, scope: ScopeFilter): any[] {
  const out: any[] = [];
  let offset = 0;
  let batch: any[];
  do {
    batch = sqlite.getSegments(scope, PAGE_SIZE, offset);
    out.push(...batch);
    offset += batch.length;
  } while (batch.length === PAGE_SIZE);
  return out;
}

export async function runMishnahParenRefs(
  sqlite: any,
  scope: ScopeFilter,
  opts?: RunMishnahParenRefsOpts
): Promise<{ matches: MishnahParenRefMatch[]; scanned: number; debugStats?: DebugStats; limited: boolean }> {
  const pagination = opts?.pagination;
  const debug = opts?.debug ?? false;
  const debugReflink = opts?.debugReflink ?? false;
  const totalCount = sqlite.countSegments(scope);
  const segments = pagination?.limit != null && pagination.limit < totalCount
    ? sqlite.getSegments(scope, pagination.limit, pagination.offset ?? 0)
    : fetchAllSegments(sqlite, scope);
  const scanned = segments.length;
  const limited = scanned < totalCount;

  const seen = new Set<string>();
  const matches: MishnahParenRefMatch[] = [];
  let totalCandidatesFound = 0;
  let totalLinksConfirmed = 0;
  const rawParensFound: string[] = [];

  let lastBookCanon: string | null = null;

  for (const seg of segments) {
    if (seg.type !== "mishnah") continue;

    const { candidates, lastBookCanon: updated } = extractor.extractWithContext(seg.textPlain, {
      id: seg.id,
      type: seg.type,
      work: seg.work,
      ref: seg.ref,
    }, { lastBookCanon });
    lastBookCanon = updated;

    if (!candidates.length) continue;

    totalCandidatesFound += candidates.length;
    if (debug && rawParensFound.length < 5) {
      candidates.forEach((c) => {
        const r = c.rawRefString ?? c.rawText ?? "";
        if (r && !rawParensFound.includes(r)) rawParensFound.push(r);
      });
    }

    const { chapter: ch, mishnah: mish } = parseChapterVerseFromSegmentRef(seg.ref || "");
    const mishnahRefHeb = formatMishnahRefHeb(seg.work, ch, mish);

    for (const cand of candidates) {
      const links = linkExplicitTanakhRef(cand, sqlite);
      if (!links.length) continue;

      let tanakhRefsHeb: string[];
      let tanakhLinks: Array<{ ref: string; refHeb: string; text?: string }>;
      let verseResolved = false;
      let verseStatus: string | undefined;
      let reflinkDebug: string | undefined;

      const chapterOnly = cand.parsedRef?.verse == null;
      const firstLink = links[0];
      const chapterVerses = (firstLink as any).chapterVerses;

      if (chapterOnly && chapterVerses?.length) {
        const quoteWindow = extractQuoteWindow(seg.textPlain, cand.spanStart ?? 0, cand.spanEnd ?? 0);
        const chapter = cand.parsedRef!.chapter;
        const cvFromRow = (r: any) => {
          const fullRef = r.ref || r.normalizedRef || "";
          const parts = String(fullRef).trim().split(/\s+/);
          const cvPart = parts.find((p: string) => /^\d+:\d+$/.test(p)) ?? parts[parts.length - 1];
          const [chStr, vStr] = (cvPart || "").split(":");
          const verseNum = vStr ? parseInt(vStr, 10) : parseInt(chStr || "0", 10);
          const cv = /^\d+:\d+$/.test(cvPart) ? cvPart : `${chapter}:${verseNum}`;
          return { ref: cv, textPlain: r.textPlain, verseNum };
        };
        const { resolved, debug: verseDebug } = resolveVerseFromChapter(
          quoteWindow,
          chapterVerses.map(cvFromRow),
          firstLink.targetWork,
          chapter,
          (w, r) => formatTanakhRefHeb(w, r),
          { collectDebug: debugReflink }
        );

        if (resolved.length) {
          verseResolved = true;
          tanakhRefsHeb = resolved.map((rv) => rv.refHeb || formatTanakhRefHeb(firstLink.targetWork, rv.ref));
          tanakhLinks = resolved.map((rv) => ({
            ref: `${firstLink.targetWork} ${rv.ref}`,
            refHeb: rv.refHeb || formatTanakhRefHeb(firstLink.targetWork, rv.ref),
            text: sanitizeDisplayText(rv.text),
          }));
        } else {
          verseStatus = "לא אותר פסוק מדויק";
          tanakhRefsHeb = links.map((l) => formatTanakhRefHeb(l.targetWork, l.targetRef));
          tanakhLinks = links.map((l) => ({
            ref: `${l.targetWork} ${l.targetRef}`,
            refHeb: formatTanakhRefHeb(l.targetWork, l.targetRef),
            text: undefined,
          }));
        }
        const mishnahExcerpt = excerptAroundMarker(seg.textPlain, cand.spanStart ?? 0, cand.spanEnd ?? 0, 200);
        reflinkDebug = debugReflink && verseDebug ? formatReflinkDebug(mishnahRefHeb, mishnahExcerpt, cand, quoteWindow, verseDebug, firstLink.targetWork, chapter) : undefined;
      } else {
        tanakhRefsHeb = links.map((l) => formatTanakhRefHeb(l.targetWork, l.targetRef));
        tanakhLinks = links.map((l) => ({
          ref: `${l.targetWork} ${l.targetRef}`,
          refHeb: formatTanakhRefHeb(l.targetWork, l.targetRef),
          text: sanitizeDisplayText(l.targetText),
        }));
        if (cand.parsedRef?.verse != null) verseResolved = true;
      }

      const key = `${seg.id}|${cand.rawRefString}|${tanakhRefsHeb[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      totalLinksConfirmed += 1;

      const excerpt = excerptAroundMarker(seg.textPlain, cand.spanStart ?? 0, cand.spanEnd ?? 0, MISHNAH_PAREN_REFS.EXCERPT_PAD);

      const matchRec: MishnahParenRefMatch = {
        mishnahRefHeb,
        mishnahRef: seg.ref || "",
        mishnahText: sanitizeDisplayText(excerpt),
        markerText: cand.rawRefString ?? cand.rawText,
        tanakhRefsHeb,
        tanakhLinks,
        verseResolved: verseResolved || undefined,
        verseStatus,
        reflinkDebug,
      };
      if (debug) {
        (matchRec as any)._debugRef = { rowRef: seg.ref, parsed: { ch, mish }, formatted: mishnahRefHeb };
      }
      matches.push(matchRec);
    }
  }

  const debugStats: DebugStats | undefined = debug
    ? {
        totalSegmentsScanned: scanned,
        totalCandidatesFound,
        totalLinksConfirmed,
        rawParensSample: rawParensFound.slice(0, 5),
      }
    : undefined;

  return { matches, scanned, debugStats, limited };
}

function excerptAroundMarker(full: string, start: number, end: number, pad: number): string {
  const s = Math.max(0, start - pad);
  const e = Math.min(full.length, end + pad);
  let ex = full.slice(s, e).trim();
  if (s > 0) ex = "…" + ex;
  if (e < full.length) ex = ex + "…";
  return ex;
}

/** Format ResolveVerseDebugInfo for RTL-readable trace debug output. */
function formatReflinkDebug(
  mishnahRefHeb: string,
  mishnahExcerpt: string,
  cand: RefCandidate,
  quoteWindow: string,
  d: ResolveVerseDebugInfo,
  targetWork: string,
  chapter: number
): string {
  const R = "\u202B"; // RTL embedding for Hebrew
  const lines: string[] = [];
  lines.push("  ─── [debug reflink] ───");
  lines.push(`  mishnahRef: ${R}${mishnahRefHeb}`);
  lines.push(`  mishnahExcerpt: ${R}${mishnahExcerpt.slice(0, 350)}`);
  lines.push(`  markerRaw: (${R}${cand.rawRefString ?? cand.rawText ?? ""})`);
  const pr = cand.parsedRef;
  const refPart = pr ? `${pr.chapter}${pr.verse != null ? `:${pr.verse}` : ""}` : "";
  const parsedTarget = pr
    ? `${formatTanakhRefHeb(pr.workCanon, refPart)} [${pr.workCanon} ${refPart}]`
    : "(none)";
  lines.push(`  markerParsed: ${parsedTarget}`);
  lines.push(`  quoteWindowRaw: ${R}${d.quoteWindowRaw || "(empty)"}`);
  lines.push(`  quoteWindowNorm: ${R}${d.quoteWindowNorm || "(empty)"}`);
  lines.push(`  quoteTokens: [${(d.quoteTokensList || []).join(", ")}] (count=${d.quoteTokens})`);
  lines.push(`  versesFetched: ${d.versesFetched}`);
  const t = d.thresholds;
  lines.push(`  thresholds: MIN_SHARED_TOKENS=${t.MIN_SHARED_TOKENS} MIN_SCORE_CONFIRMED=${t.MIN_SCORE_CONFIRMED} QUOTE_WINDOW=${t.QUOTE_WINDOW_MIN}-${t.QUOTE_WINDOW_MAX}`);
  if (d.candidates.length) {
    lines.push("  top candidates:");
    for (const c of d.candidates) {
      const pass = c.passed ? "✓" : "✗";
      lines.push(`    - ${R}${c.refHeb} shared=${c.sharedTokens} total=${c.totalQuoteTokens} score=${c.score.toFixed(2)} contiguous=${c.contiguousLength ?? 0} ${pass} ${c.decisionReason ?? ""}`);
    }
  }
  lines.push(`  decision: ${d.decision} | ${d.decisionReason ?? ""}`);
  if (d.fallbackUsed) lines.push("  FALLBACK_USED=true");
  return lines.join("\n");
}

export function buildMishnahParenRefsPlanResult(
  matches: MishnahParenRefMatch[],
  scanned: number,
  plan: QueryPlan,
  limited: boolean
): PlanResult {
  if (!matches.length) {
    return { kind: "REFUSAL", message: "לא נמצאו ציטוטים מפורשים (בסוגריים) מהתנ\"ך במסכת זו." };
  }

  const uniqueTanakh = new Set<string>();
  matches.forEach((m) => m.tanakhRefsHeb.forEach((r) => uniqueTanakh.add(r)));

  return {
    kind: "OK",
    answer: `נמצאו ${matches.length} מקורות עם ציון מפורש (בסוגריים). ${uniqueTanakh.size} פסוקים/פרקים מהתנ\"ך.`,
    rows: matches as any,
    totals: {
      scanned,
      withCandidates: matches.length,
      confirmed: matches.length,
      unconfirmed: 0,
      limited,
    },
    plan,
  };
}
