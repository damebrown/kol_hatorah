import { RefDetectMethod } from "./RefDetectMethod";

export type RefCandidateKind = "QUOTE_SPAN" | "EXPLICIT_REF" | "UNKNOWN";
export type ConfidenceHint = "HIGH" | "MEDIUM" | "LOW";

export interface RefCandidate {
  sourceSegmentId?: string;
  sourceType?: string;
  sourceWork?: string;
  sourceRef?: string;
  spanStart?: number;
  spanEnd?: number;
  rawText: string;
  normalizedText: string;
  signal: string;
  candidateKind: RefCandidateKind;
  method: RefDetectMethod;
  confidenceHint: ConfidenceHint;
  rawRefString?: string;
  /** Pre-parsed ref (used by linker for "שם" and to avoid re-parsing). */
  parsedRef?: {
    workCanon: string;
    chapter: number;
    verse: number | null;
    normalizedRefPrefix: string;
  };
}
