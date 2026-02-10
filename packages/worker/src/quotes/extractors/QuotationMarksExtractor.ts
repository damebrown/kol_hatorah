import { normalizeText } from "@kol-hatorah/core";
import { QUOTE_CONSTANTS } from "../constants";
import { QuoteCandidate } from "../types/QuoteCandidate";
import { QuoteMethod } from "../types/QuoteMethod";
import { QuoteExtractor } from "./QuoteExtractor";

export class QuotationMarksExtractor implements QuoteExtractor {
  name = QuoteMethod.QUOTATION_MARKS as const;
  appliesTo = { type: "any" as const };

  extract(text: string): QuoteCandidate[] {
    const candidates: QuoteCandidate[] = [];
    const regex = /["״]([^"״]{4,200})["״]/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      const raw = match[1].trim();
      if (raw.length < QUOTE_CONSTANTS.MIN_QUOTE_LEN_CHARS || raw.length > QUOTE_CONSTANTS.MAX_QUOTE_LEN_CHARS) continue;
      const norm = normalizeText(raw);
      const words = norm.textPlain.trim().split(/\s+/);
      if (words.length < QUOTE_CONSTANTS.MIN_QUOTE_WORDS) continue;
      candidates.push({
        method: QuoteMethod.QUOTATION_MARKS,
        startIdx: match.index,
        endIdx: match.index + match[0].length,
        quoteTextRaw: raw,
        quoteTextNormalized: norm.textPlain,
        signal: "quotes",
        confidenceHint: "MEDIUM",
      });
    }
    return candidates;
  }
}
