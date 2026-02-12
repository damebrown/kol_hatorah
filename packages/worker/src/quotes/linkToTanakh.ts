import { normalizeText } from "@kol-hatorah/core";
import { QUOTE_CONSTANTS } from "./constants";
import { QuoteCandidate } from "./types/QuoteCandidate";
import { QuoteLink } from "./types/QuoteLink";
import { SQLiteManager } from "../storage/sqlite";

const tokenize = (s: string) => normalizeText(s).textPlain.trim().split(/\s+/).filter(Boolean);

export function linkToTanakh(candidate: QuoteCandidate, opts: { topK?: number }, sqlite: SQLiteManager): QuoteLink[] {
  const words = tokenize(candidate.quoteTextRaw);
  if (!words.length) return [];

  const matchStr = words.map((w) => `${w}*`).join(" AND ");
  const rows = sqlite.searchByMatch(matchStr, { type: "tanakh" }, opts.topK || QUOTE_CONSTANTS.TANAKH_TOP_K);

  const scored: QuoteLink[] = [];
  for (const row of rows) {
    const tanakhTokens = tokenize(row.textPlain);
    const shared = words.filter((w) => tanakhTokens.includes(w));
    const score = shared.length / words.length;
    if (shared.length >= QUOTE_CONSTANTS.TANAKH_MIN_SHARED_WORDS && score >= QUOTE_CONSTANTS.TANAKH_MIN_SCORE) {
      scored.push({
        tanakhRef: row.ref || row.normalizedRef,
        tanakhId: row.id,
        score,
        sharedWords: shared.length,
        totalWords: words.length,
      tanakhText: row.textPlain,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.topK || QUOTE_CONSTANTS.TANAKH_TOP_K);
}
