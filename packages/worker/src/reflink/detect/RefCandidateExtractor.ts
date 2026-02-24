import { RefCandidate } from "../types/RefCandidate";
import { RefDetectMethod } from "../types/RefDetectMethod";

export interface RefCandidateExtractor {
  name: RefDetectMethod;
  appliesTo: (meta: { type?: string; work?: string }) => boolean;
  extract: (text: string, meta: { type?: string; work?: string; id?: string; ref?: string }) => RefCandidate[];
}
