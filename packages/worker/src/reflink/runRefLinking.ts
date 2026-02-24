import { DEFAULT_EXTRACTORS } from "./detect";
import { RefCandidate } from "./types/RefCandidate";
import { RefLinkResult } from "./types/RefLinkResult";
import { linkCandidates } from "./link/runLinking";

interface RunOptions {
  targetTypes?: string[];
  sqlite: any;
}

export async function runRefLinking(
  text: string,
  meta: { id?: string; type?: string; work?: string; ref?: string },
  opts: RunOptions
): Promise<RefLinkResult[]> {
  const candidates: RefCandidate[] = [];
  for (const extractor of DEFAULT_EXTRACTORS) {
    if (!extractor.appliesTo(meta)) continue;
    candidates.push(...extractor.extract(text, meta));
  }
  return linkCandidates(candidates, opts.sqlite, { targetTypes: opts.targetTypes });
}
