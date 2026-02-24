import { normalizeText } from "@kol-hatorah/core";
import { INTRODUCERS } from "../constants";
import { RefCandidateExtractor } from "./RefCandidateExtractor";
import { RefCandidate } from "../types/RefCandidate";
import { RefDetectMethod } from "../types/RefDetectMethod";

const punctuationStop = /[.:;？！!]|$/;

export class IntroducerSpanExtractor implements RefCandidateExtractor {
  name = RefDetectMethod.INTRO_SPAN as const;
  appliesTo = (_meta: { type?: string }) => true;

  extract(text: string, meta: { type?: string; work?: string; id?: string; ref?: string }): RefCandidate[] {
    const candidates: RefCandidate[] = [];
    const textNorm = normalizeText(text).textNorm; // strip niqqud so introducers match
    const lists: string[] = [
      ...(INTRODUCERS.tanakh || []),
      ...(INTRODUCERS.mishnah || []),
      ...(INTRODUCERS.bavli || []),
    ];
    for (const intro of lists) {
      let idx = textNorm.indexOf(intro);
      while (idx !== -1) {
        const startSearch = idx + intro.length;
        const remainder = textNorm.slice(startSearch);
        const match = remainder.match(punctuationStop);
        const stopRel = match ? match.index ?? remainder.length : remainder.length;
        const span = remainder.slice(0, stopRel);
        const quoted = span.match(/[\"״](.+?)[\"״]/);
        let extracted = quoted ? quoted[1] : span.trim();
        extracted = extracted.replace(/\s*\([^)]+\)\s*/g, " ").trim(); // drop parenthetical refs for linking
        const norm = normalizeText(extracted);
        if (norm.textNorm.length >= 4) {
          candidates.push({
            sourceSegmentId: meta.id,
            sourceType: meta.type,
            sourceWork: meta.work,
            sourceRef: meta.ref,
            spanStart: startSearch,
            spanEnd: startSearch + span.length,
            rawText: extracted,
            normalizedText: norm.textNorm,
            signal: intro,
            candidateKind: "QUOTE_SPAN",
            method: RefDetectMethod.INTRO_SPAN,
            confidenceHint: "HIGH",
          });
        }
        idx = textNorm.indexOf(intro, startSearch);
      }
    }
    return candidates;
  }
}
