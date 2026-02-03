import { qdrantDeleteByFilterCommand } from "./cli-extra";
import { askCommand } from "./cli/commands/ask";
import { debugIdsCommand } from "./cli/commands/debug-ids";
import { evalQueriesCommand } from "./cli/commands/eval-queries";
import { getRefCommand } from "./cli/commands/get-ref";
import { ingestSefariaMishnahAllCommand } from "./cli/commands/ingest-mishnah";
import { ingestSefariaTanakhAllCommand } from "./cli/commands/ingest-tanakh";
import { lexFindCommand } from "./cli/commands/lex-find";
import { qdrantSmokeTest } from "./cli/commands/qdrant-smoke";
import { sefariaInspectCommand } from "./cli/commands/sefaria-inspect";

const commands: Record<string, () => Promise<void>> = {
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

const command = process.argv[2];
const handler = command ? commands[command] : undefined;

if (!handler) {
  console.error(`Unknown command: ${command || "(none)"}`);
  console.error("Available commands:");
  Object.keys(commands)
    .sort()
    .forEach((name) => console.error(`  ${name}`));
  process.exit(1);
}

handler().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
