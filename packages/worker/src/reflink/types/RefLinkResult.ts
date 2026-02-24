import { RefCandidate } from "./RefCandidate";
import { RefLink } from "./RefLink";

export interface RefLinkResult {
  candidate: RefCandidate;
  links: RefLink[];
  status: "CONFIRMED" | "UNCONFIRMED";
}
