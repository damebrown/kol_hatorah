import { QuoteCandidate } from "./types/QuoteCandidate";
import { QuoteDetectionResult } from "./types/QuoteDetectionResult";
import { QuoteExtractor, CONF_RANK } from "./extractors/QuoteExtractor";
import { IntroWordExtractor } from "./extractors/IntroWordExtractor";
import { QuotationMarksExtractor } from "./extractors/QuotationMarksExtractor";
import { QUOTE_CONSTANTS } from "./constants";
import { QuoteLink } from "./types/QuoteLink";
import { linkToTanakh } from "./linkToTanakh";
import { SQLiteManager } from "../storage/sqlite";

const extractors: QuoteExtractor[] = [new IntroWordExtractor(), new QuotationMarksExtractor()];

export function detectQuoteCandidates(text: string, opts?: { type?: string }): QuoteCandidate[] {
  const applicable = extractors.filter((ex) => ex.appliesTo.type === "any" || ex.appliesTo.type === opts?.type);
  let candidates: QuoteCandidate[] = [];
  for (const ex of applicable) {
    candidates = candidates.concat(ex.extract(text || ""));
  }
  // sort by confidence then position
  candidates.sort((a, b) => {
    const rankDiff = CONF_RANK[b.confidenceHint] - CONF_RANK[a.confidenceHint];
    if (rankDiff !== 0) return rankDiff;
    return a.startIdx - b.startIdx;
  });
  // dedupe overlaps
  const deduped: QuoteCandidate[] = [];
  for (const c of candidates) {
    const overlap = deduped.find((d) => !(c.endIdx <= d.startIdx || c.startIdx >= d.endIdx));
    if (overlap) continue;
    deduped.push(c);
  }
  return deduped;
}

export function detectQuotesWithLinks(
  text: string,
  opts: { type?: string; sqlite?: SQLiteManager }
): QuoteDetectionResult[] {
  const cands = detectQuoteCandidates(text, opts);
  if (!cands.length) return [];
  const sqlite = opts.sqlite;
  const results: QuoteDetectionResult[] = [];
  for (const c of cands) {
    let matches: QuoteLink[] = [];
    if (sqlite) {
      matches = linkToTanakh(c, { topK: QUOTE_CONSTANTS.TANAKH_TOP_K }, sqlite);
    }
    const confirmed = matches.length > 0;
    results.push({
      candidate: c,
      status: confirmed ? "CONFIRMED" : "UNCONFIRMED",
      matches,
    });
  }
  return results;
}
