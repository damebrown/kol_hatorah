import { QuoteMethod } from "./QuoteMethod";

export type ConfidenceHint = "HIGH" | "MEDIUM" | "LOW";

export interface QuoteCandidate {
  method: QuoteMethod;
  startIdx: number;
  endIdx: number;
  quoteTextRaw: string;
  quoteTextNormalized: string;
  signal: string;
  confidenceHint: ConfidenceHint;
}
