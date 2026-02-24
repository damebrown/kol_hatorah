import { RefCandidate } from "../types/RefCandidate";
import { RefLinkResult } from "../types/RefLinkResult";
import { linkCandidate } from "./linkCandidates";

export async function linkCandidates(
  candidates: RefCandidate[],
  sqlite: any,
  options: { targetTypes?: string[] } = {}
): Promise<RefLinkResult[]> {
  const results: RefLinkResult[] = [];
  for (const cand of candidates) {
    const links = await linkCandidate(cand, sqlite, options);
    results.push({
      candidate: cand,
      links,
      status: links.some((l) => l.status === "CONFIRMED") ? "CONFIRMED" : "UNCONFIRMED",
    });
  }
  return results;
}
