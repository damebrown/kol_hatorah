import { qdrantSmokeTest } from "./commands/qdrantSmoke";
import { askCommand } from "./commands/ask";
import { ingestSefariaTanakhAllCommand, ingestSefariaMishnahAllCommand, ingestTanakhCommentariesCommand } from "./commands/ingest";
import { ingestBavliCommand } from "./commands/ingestBavli";
import { evalQueriesCommand } from "./commands/evalQueries";
import { evalGraphAugmentCommand } from "./commands/evalGraphAugment";
import { lexFindCommand } from "./commands/lex";
import { getRefCommand } from "./commands/getRef";
import { debugIdsCommand } from "./commands/debugIds";
import { sefariaInspectCommand } from "./commands/sefariaInspect";
import { qdrantDeleteByFilterCommand } from "./commands/qdrantDeleteByFilter";
import { deleteCommentaryEnglishCommand } from "./commands/deleteCommentaryEnglish";
import { enrichMetadataCommand } from "./commands/enrichMetadata";
import { tanakhCommentaryReduceAndGraphEnrichCommand } from "./commands/tanakhCommentaryReduceAndGraphEnrich";
import { ingestCorporaCommand } from "./commands/ingestCorpora";

export async function runCli() {
  const command = process.argv[2];

  const runners: Record<string, () => Promise<void>> = {
    "qdrant-smoke": qdrantSmokeTest,
    ask: askCommand,
    "ingest-tanakh": ingestSefariaTanakhAllCommand,
    "ingest-mishnah": ingestSefariaMishnahAllCommand,
    "ingest-tanakh-commentaries": ingestTanakhCommentariesCommand,
    "ingest-bavli": ingestBavliCommand,
    "ingest-corpora": ingestCorporaCommand,
    "eval-queries": evalQueriesCommand,
    "eval-graph-augment": evalGraphAugmentCommand,
    "qdrant:delete-by-filter": qdrantDeleteByFilterCommand,
    "delete-commentary-english": deleteCommentaryEnglishCommand,
    "lex-find": lexFindCommand,
    "get-ref": getRefCommand,
    "debug-ids": debugIdsCommand,
    "sefaria-inspect": sefariaInspectCommand,
    "enrich:metadata": enrichMetadataCommand,
    "reingest:enrich": enrichMetadataCommand,
    "tanakh-commentary:reduce-and-graph-enrich": tanakhCommentaryReduceAndGraphEnrichCommand,
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
