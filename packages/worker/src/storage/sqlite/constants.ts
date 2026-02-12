import path from "path";
import fs from "fs";

const CANDIDATE_PATHS = [
  // When run from workspace root with nested path created by earlier scripts
  path.join(process.cwd(), "packages/worker/packages/worker/.local/hebrag_lexical.sqlite"),
  // When running from repo root (kt, direct tsx)
  path.join(process.cwd(), "packages/worker/.local/hebrag_lexical.sqlite"),
  // When running from workspace dir (npm --workspace packages/worker run ...)
  path.join(process.cwd(), ".local/hebrag_lexical.sqlite"),
  // Relative to compiled/dist location
  path.resolve(__dirname, "../../.local/hebrag_lexical.sqlite"),
  // Safety: relative to repo root via dist path
  path.resolve(__dirname, "../../../packages/worker/.local/hebrag_lexical.sqlite"),
];

export function resolveSqlitePath(): string {
  if (process.env.SQLITE_PATH) return process.env.SQLITE_PATH;
  // prefer existing non-empty
  for (const p of CANDIDATE_PATHS) {
    try {
      const stat = fs.statSync(p);
      if (stat.isFile() && stat.size > 0) return p;
    } catch {}
  }
  // fallback to any existing
  for (const p of CANDIDATE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  // last resort
  return CANDIDATE_PATHS[0];
}
