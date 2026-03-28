import minimist from "minimist";
import { resolveCorpusIdsFromCli } from "../../ingest/corpora/registry";
import { runIngestCorpora } from "../../ingest/ingestCorpora";

/**
 * Ingest major non-Bavli corpora from local Sefaria export (`Hebrew/merged.json` only),
 * with the same API enrichment path as Bavli (name → v3 texts → links). Work metadata →
 * `corpus_works`; links → `ref_links` (with `source_work`).
 *
 * Examples:
 *   npm --workspace packages/worker run ingest:corpora -- --preset classical-core
 *   npm --workspace packages/worker run ingest:corpora -- --corpora "moreh,siddur" --limit 200
 *   npm --workspace packages/worker run ingest:corpora -- --preset classical-core --no-embed --api-concurrency 2
 */
export async function ingestCorporaCommand() {
  const argv = minimist(process.argv.slice(2), {
    string: [
      "corpora",
      "preset",
      "limit",
      "load-batch-size",
      "api-concurrency",
      "embed-batch-size",
      "qdrant-batch-size",
      "reset-corpus",
    ],
    // Do not list qdrant/sqlite as booleans: minimist defaults omitted flags to false and would disable SQLite/Qdrant.
    boolean: ["reset", "resume", "no-qdrant", "no-sqlite", "no-embed"],
  });

  let corpusIds: string[];
  try {
    corpusIds = resolveCorpusIdsFromCli({
      corpora: argv.corpora ?? argv.c,
      preset: argv.preset,
    });
  } catch (e) {
    console.error(String(e));
    process.exit(1);
    return;
  }

  const limit = argv.limit ? parseInt(String(argv.limit), 10) : 0;
  const reset = !!argv.reset;
  const resetCorpus = argv["reset-corpus"]
    ? String(argv["reset-corpus"])
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true && argv["no-embed"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;

  const loadBatchSize = argv["load-batch-size"] ? parseInt(String(argv["load-batch-size"]), 10) : undefined;
  const apiConcurrency = argv["api-concurrency"] ? parseInt(String(argv["api-concurrency"]), 10) : undefined;
  const embedBatchSize = argv["embed-batch-size"] ? parseInt(String(argv["embed-batch-size"]), 10) : undefined;
  const qdrantBatchSize = argv["qdrant-batch-size"] ? parseInt(String(argv["qdrant-batch-size"]), 10) : undefined;

  await runIngestCorpora({
    corpusIds,
    limit: limit || undefined,
    reset,
    resetCorpus,
    doQdrant,
    doSqlite,
    loadBatchSize,
    apiConcurrency,
    embedBatchSize,
    qdrantBatchSize,
  });
  process.exit(process.exitCode ?? 0);
}
