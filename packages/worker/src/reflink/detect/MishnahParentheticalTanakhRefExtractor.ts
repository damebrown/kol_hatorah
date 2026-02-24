import { RefCandidateExtractor } from "./RefCandidateExtractor";
import { RefCandidate } from "../types/RefCandidate";
import { RefDetectMethod } from "../types/RefDetectMethod";
import { parseTanakhRefHebrewFromMarker } from "../parseTanakhRefHebrew";
import { TANAKH_HEB_TO_CANONICAL } from "../../planner/scope/mappings/tanakhBooks";

const PAREN_REF_RE = /\(([^)]+)\)/g;
const NIQQUD_RE = /[\u0591-\u05C7]/g;
const HEBREW_NUMERAL_RE = /[\dא-ת\"״׳'‎]+/;

/** Only accept paren if it looks like a Tanakh ref: starts with known book or "שם", has numeral. */
function looksLikeTanakhRef(inner: string): boolean {
  const stripped = inner.replace(NIQQUD_RE, "").trim();
  if (!stripped || !HEBREW_NUMERAL_RE.test(stripped)) return false;
  const firstToken = stripped.split(/\s+/)[0] || "";
  if (firstToken === "שם") return true;
  const books = Object.keys(TANAKH_HEB_TO_CANONICAL);
  const firstStripped = firstToken.replace(NIQQUD_RE, "");
  return books.some((b) => {
    const bs = b.replace(NIQQUD_RE, "");
    return stripped.startsWith(bs) || stripped.startsWith(b);
  });
}

export interface ExtractWithContextResult {
  candidates: RefCandidate[];
  lastBookCanon: string | null;
}

/**
 * Mishnah-specific extractor: finds parenthetical Tanakh refs like "(יחזקאל כג)" or "(שם כז)".
 * For "שם", uses context.lastBookCanon. Returns updated context for next segment.
 */
export class MishnahParentheticalTanakhRefExtractor implements RefCandidateExtractor {
  name = RefDetectMethod.EXPLICIT_REF as const;
  appliesTo = (meta: { type?: string }) => meta.type === "mishnah";

  extract(text: string, meta: { type?: string; work?: string; id?: string; ref?: string }): RefCandidate[] {
    return this.extractWithContext(text, meta).candidates;
  }

  extractWithContext(
    text: string,
    meta: { type?: string; work?: string; id?: string; ref?: string },
    context?: { lastBookCanon: string | null }
  ): ExtractWithContextResult {
    if (meta.type !== "mishnah") return { candidates: [], lastBookCanon: context?.lastBookCanon ?? null };

    const candidates: RefCandidate[] = [];
    let lastBookCanon = context?.lastBookCanon ?? null;
    const matches: RegExpExecArray[] = [];
    let m: RegExpExecArray | null;
    while ((m = PAREN_REF_RE.exec(text)) !== null) {
      matches.push(m);
    }

    for (const m of matches) {
      const inner = m[1].trim();
      if (!looksLikeTanakhRef(inner)) continue;

      const parsed = parseTanakhRefHebrewFromMarker(inner, lastBookCanon ? { lastBookCanon } : undefined);
      if (!parsed) continue;

      if (!parsed.isSham) lastBookCanon = parsed.workCanon;

      candidates.push({
        sourceSegmentId: meta.id,
        sourceType: meta.type,
        sourceWork: meta.work,
        sourceRef: meta.ref,
        spanStart: m.index,
        spanEnd: m.index + m[0].length,
        rawText: inner,
        normalizedText: parsed.normalizedRefPrefix,
        signal: "PAREN_REF",
        candidateKind: "EXPLICIT_REF",
        method: RefDetectMethod.EXPLICIT_REF,
        confidenceHint: "HIGH",
        rawRefString: parsed.rawRefString,
        parsedRef: {
          workCanon: parsed.workCanon,
          chapter: parsed.chapter,
          verse: parsed.verse,
          normalizedRefPrefix: parsed.normalizedRefPrefix,
        },
      });
    }
    return { candidates, lastBookCanon };
  }
}
