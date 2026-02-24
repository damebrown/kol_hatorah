#!/usr/bin/env node
import { runCli } from "../cli/index";
import { normalizeQueryInput } from "../cli/utils/normalizeQuery";
import { parseAskArgs } from "../cli/utils/parseAskArgs";

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  if (!sub) {
    console.error("שימוש: kt ask '<שאלה>' או: echo '<שאלה>' | kt ask --stdin");
    process.exit(1);
  }
  if (sub !== "ask") {
    console.error(`פקודה לא מוכרת: ${sub}`);
    process.exit(1);
  }

  const { flags, queryRaw, useStdin } = parseAskArgs(args.slice(1));
  const hasDebug = flags.includes("--debug");

  const proceed = async () => {
    let query = queryRaw;
    if ((!query || useStdin) && process.stdin.isTTY === false) {
      const fromStdin = await readStdin();
      query = fromStdin;
    }
    query = normalizeQueryInput(query);
    if (!query) {
      console.error("חסר טקסט שאלה. דוגמא: kt ask '...' או echo '...' | kt ask --stdin");
      process.exit(1);
    }
    if (hasDebug && query.includes(`"`)) {
      console.error("טיפ: עדיף לעטוף את השאלה בגרשיים בודדים: kt ask '...\"...\"...'");
    }
    process.argv = [process.argv[0], process.argv[1], "ask", "--q", query, ...flags];
    runCli();
  };

  proceed();
}

main();
