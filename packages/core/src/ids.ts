import { createHash } from "crypto";

interface CreateChunkIdArgs {
  type: string;
  work: string;
  ref?: string;
  normalizedRef?: string;
  lang: string;
  versionTitle?: string;
  source?: string;
}

export function createChunkId(args: CreateChunkIdArgs): string {
  const { type, work, ref, normalizedRef, lang, versionTitle, source } = args;
  const key = `${type}|${work}|${normalizedRef || ref || ""}|${lang}|${versionTitle || ""}|${source || ""}`;
  const hash = createHash("sha256").update(key).digest("hex");
  // Use first 32 hex chars for brevity; still deterministic/stable.
  return hash.substring(0, 32);
}
