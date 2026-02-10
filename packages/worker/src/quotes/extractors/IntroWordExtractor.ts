import { normalizeText } from "@kol-hatorah/core";
import { QUOTE_CONSTANTS, INTRODUCERS } from "../constants";
import { QuoteCandidate } from "../types/QuoteCandidate";
import { QuoteMethod } from "../types/QuoteMethod";
import { QuoteExtractor } from "./QuoteExtractor";

const punctuationStop = /[.:;？！!]|$/;

export class IntroWordExtractor implements QuoteExtractor {
  name = QuoteMethod.INTRO_WORD as const;
  appliesTo = { type: "any" as const };

  extract(text: string): QuoteCandidate[] {
    const candidates: QuoteCandidate[] = [];
    const introList = [...INTRODUCERS.mishnah, ...INTRODUCERS.general];
    for (const intro of introList) {
      let idx = text.indexOf(intro);
      while (idx !== -1) {
        const startSearch = idx + intro.length;
        const remainder = text.slice(startSearch);
        const match = remainder.match(punctuationStop);
        const stopRel = match ? match.index ?? remainder.length : remainder.length;
        const span = remainder.slice(0, Math.min(stopRel, QUOTE_CONSTANTS.INTRO_FOLLOW_WINDOW));

        // If quotes appear, tighten to inside quotes
        const quoted = span.match(/[\"״](.+?)[\"״]/);
        const extracted = quoted ? quoted[1] : span.trim();

        if (extracted.length >= QUOTE_CONSTANTS.MIN_QUOTE_LEN_CHARS && extracted.length <= QUOTE_CONSTANTS.MAX_QUOTE_LEN_CHARS) {
          const norm = normalizeText(extracted);
          const wordCount = norm.textPlain.trim().split(/\s+/).length;
          if (wordCount >= QUOTE_CONSTANTS.MIN_QUOTE_WORDS) {
            candidates.push({
              method: QuoteMethod.INTRO_WORD,
              startIdx: startSearch,
              endIdx: startSearch + span.length,
              quoteTextRaw: extracted,
              quoteTextNormalized: norm.textPlain,
              signal: intro,
              confidenceHint: "HIGH",
            });
          }
        }

        idx = text.indexOf(intro, startSearch);
      }
    }
    return candidates;
  }
}
