import { RefVerifyMethod } from "./RefVerifyMethod";

export type RefLinkStatus = "CONFIRMED" | "UNCONFIRMED";

export interface RefLink {
  candidateId?: string;
  targetSegmentId: string;
  targetType: string;
  targetWork: string;
  targetRef: string;
  score: number;
  verifier: RefVerifyMethod;
  status: RefLinkStatus;
  debug?: any;
  targetText?: string;
  /** All verses in chapter (for verse resolution when ref is chapter-only). */
  chapterVerses?: Array<{ id?: string; ref?: string; textPlain?: string }>;
}
