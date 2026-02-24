import { normalizeText } from "@kol-hatorah/core";
import { RefCandidateExtractor } from "./RefCandidateExtractor";
import { RefCandidate } from "../types/RefCandidate";
import { RefDetectMethod } from "../types/RefDetectMethod";

// Simple patterns: book chap or book chap:verse
const TANAKH_REF_RE = /([א-ת\"״׳'\- ]+)\s+(\d{1,3})(?::(\d{1,3}))?/g;

export class ExplicitRefExtractor implements RefCandidateExtractor {
  name = RefDetectMethod.EXPLICIT_REF as const;
  appliesTo = () => true;

  extract(text: string, meta: { type?: string; work?: string; id?: string; ref?: string }): RefCandidate[] {
    const out: RefCandidate[] = [];
    let m;
    while ((m = TANAKH_REF_RE.exec(text)) !== null) {
      const raw = m[0];
      const norm = normalizeText(raw).textPlain;
      if (!norm || norm.length < 3) continue;
      out.push({
        sourceSegmentId: meta.id,
        sourceType: meta.type,
        sourceWork: meta.work,
        sourceRef: meta.ref,
        spanStart: m.index,
        spanEnd: m.index + raw.length,
        rawText: raw,
        normalizedText: norm,
        signal: "explicit-ref",
        candidateKind: "EXPLICIT_REF",
        method: RefDetectMethod.EXPLICIT_REF,
        confidenceHint: "HIGH",
      });
    }
    return out;
  }
}
