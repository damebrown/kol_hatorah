import { RefCandidateExtractor } from "./RefCandidateExtractor";
import { IntroducerSpanExtractor } from "./IntroducerSpanExtractor";
import { QuotationMarksExtractor } from "./QuotationMarksExtractor";
import { ExplicitRefExtractor } from "./ExplicitRefExtractor";

export const DEFAULT_EXTRACTORS: RefCandidateExtractor[] = [
  new ExplicitRefExtractor(),
  new IntroducerSpanExtractor(),
  new QuotationMarksExtractor(),
];
