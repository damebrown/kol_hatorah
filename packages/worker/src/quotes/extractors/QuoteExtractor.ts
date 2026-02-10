import { QuoteCandidate, ConfidenceHint } from "../types/QuoteCandidate";
import { QuoteMethod } from "../types/QuoteMethod";

export interface QuoteExtractor {
  name: QuoteMethod;
  appliesTo: { type?: "mishnah" | "bavli" | "any" };
  extract(text: string): QuoteCandidate[];
}

export const CONF_RANK: Record<ConfidenceHint, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};
