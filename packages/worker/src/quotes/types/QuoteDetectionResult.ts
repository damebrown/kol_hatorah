import { QuoteCandidate } from "./QuoteCandidate";
import { QuoteLink } from "./QuoteLink";

export interface QuoteDetectionResult {
  candidate: QuoteCandidate;
  status: "CONFIRMED" | "UNCONFIRMED";
  matches: QuoteLink[];
}
