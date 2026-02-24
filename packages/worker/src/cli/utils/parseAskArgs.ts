export interface AskArgParseResult {
  flags: string[];
  queryRaw: string;
  useStdin: boolean;
}

export function parseAskArgs(argv: string[]): AskArgParseResult {
  const flags: string[] = [];
  const queryParts: string[] = [];
  let useStdin = false;
  for (const token of argv) {
    if (token === "--stdin") {
      useStdin = true;
      continue;
    }
    if (token.startsWith("--")) {
      flags.push(token);
      continue;
    }
    queryParts.push(token);
  }
  return { flags, queryRaw: queryParts.join(" ").trim(), useStdin };
}
