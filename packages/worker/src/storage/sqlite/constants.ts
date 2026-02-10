import path from "path";

export const DEFAULT_SQLITE_PATH =
  process.env.SQLITE_PATH || path.join(process.cwd(), "packages/worker/.local/hebrag_lexical.sqlite");
