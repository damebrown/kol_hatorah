import { qdrantSmokeTest } from "./commands/qdrantSmoke";
import { askCommand } from "./commands/ask";
import { ingestSefariaTanakhAllCommand, ingestSefariaMishnahAllCommand } from "./commands/ingest";
import { evalQueriesCommand } from "./commands/evalQueries";
import { lexFindCommand } from "./commands/lex";
import { getRefCommand } from "./commands/getRef";
import { debugIdsCommand } from "./commands/debugIds";
import { sefariaInspectCommand } from "./commands/sefariaInspect";
import { qdrantDeleteByFilterCommand } from "./commands/qdrantDeleteByFilter";

export async function runCli() {
  const command = process.argv[2];

  const runners: Record<string, () => Promise<void>> = {
    "qdrant-smoke": qdrantSmokeTest,
    ask: askCommand,
    "ingest-tanakh": ingestSefariaTanakhAllCommand,
    "ingest-mishnah": ingestSefariaMishnahAllCommand,
    "eval-queries": evalQueriesCommand,
    "qdrant:delete-by-filter": qdrantDeleteByFilterCommand,
    "lex-find": lexFindCommand,
    "get-ref": getRefCommand,
    "debug-ids": debugIdsCommand,
    "sefaria-inspect": sefariaInspectCommand,
  };

  const runner = runners[command || ""];
  if (!runner) {
    console.error(`Unknown command: ${command || "(none)"}`);
    console.error("Available commands:");
    Object.keys(runners).forEach((c) => console.error(`  ${c}`));
    process.exit(1);
  }

  try {
    await runner();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runCli();
}
