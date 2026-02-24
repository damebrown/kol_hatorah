import { normalizeText } from "@kol-hatorah/core";
import { RefCandidateExtractor } from "./RefCandidateExtractor";
import { RefCandidate } from "../types/RefCandidate";
import { RefDetectMethod } from "../types/RefDetectMethod";

const QUOTE_RE = /[\"״](.+?)[\"״]/g;

export class QuotationMarksExtractor implements RefCandidateExtractor {
  name = RefDetectMethod.QUOTATION_MARKS as const;
  appliesTo = () => true;

  extract(text: string, meta: { type?: string; work?: string; id?: string; ref?: string }): RefCandidate[] {
    const out: RefCandidate[] = [];
    let m;
    while ((m = QUOTE_RE.exec(text)) !== null) {
      const raw = m[1];
      const norm = normalizeText(raw).textPlain;
      if (!norm || norm.length < 3) continue;
      out.push({
        sourceSegmentId: meta.id,
        sourceType: meta.type,
        sourceWork: meta.work,
        sourceRef: meta.ref,
        spanStart: m.index,
        spanEnd: m.index + m[0].length,
        rawText: raw,
        normalizedText: norm,
        signal: "quotes",
        candidateKind: "QUOTE_SPAN",
        method: RefDetectMethod.QUOTATION_MARKS,
        confidenceHint: "MEDIUM",
      });
    }
    return out;
  }
}
