import minimist from "minimist";
import { BAVLI_CORE_TRACTATES, parseTractatesList, runIngestBavli } from "../../ingest/ingestBavli";

/**
 * Ingest Babylonian Talmud tractates from local Sefaria export (merged Hebrew JSON),
 * with Sefaria API enrichment (refs, index metadata, links). API failures log warnings only.
 *
 * Checkpoint: by default the run **resumes** from `.checkpoints/sefaria-bavli.json` (skips tractates
 * already finished). Use `--reset` to ignore the file, or `--reset-work Tractate` to re-do one tractate.
 * There is no `--resume` flag — resuming is the default unless you pass `--reset`.
 *
 * Examples:
 *   npm --workspace packages/worker run ingest:bavli -- --tractates bavli-core
 *   npm --workspace packages/worker run ingest:bavli -- --tractates "Berakhot,Shabbat" --limit 500
 *   npm --workspace packages/worker run ingest:bavli -- --tractates bavli-core --no-embed --api-concurrency 2
 */
export async function ingestBavliCommand() {
  const argv = minimist(process.argv.slice(2), {
    string: [
      "tractates",
      "reset-work",
      "load-batch-size",
      "api-concurrency",
      "embed-batch-size",
      "qdrant-batch-size",
    ],
    boolean: ["reset", "no-qdrant", "no-sqlite", "no-embed"],
  });

  const tractatesArg = argv.tractates ?? argv.t;
  const tractates = parseTractatesList(tractatesArg, [...BAVLI_CORE_TRACTATES]);

  const limit = argv.limit ? parseInt(String(argv.limit), 10) : 0;
  const reset = !!argv.reset;
  const resetWork = argv["reset-work"] ? String(argv["reset-work"]).split(",").map((s) => s.trim()) : [];

  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true && argv["no-embed"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;

  const loadBatchSize = argv["load-batch-size"] ? parseInt(String(argv["load-batch-size"]), 10) : undefined;
  const apiConcurrency = argv["api-concurrency"] ? parseInt(String(argv["api-concurrency"]), 10) : undefined;
  const embedBatchSize = argv["embed-batch-size"] ? parseInt(String(argv["embed-batch-size"]), 10) : undefined;
  const qdrantBatchSize = argv["qdrant-batch-size"] ? parseInt(String(argv["qdrant-batch-size"]), 10) : undefined;

  await runIngestBavli({
    tractates,
    limit: limit || undefined,
    reset,
    resetWorks: resetWork,
    doQdrant,
    doSqlite,
    loadBatchSize,
    apiConcurrency,
    embedBatchSize,
    qdrantBatchSize,
  });
  process.exit(process.exitCode ?? 0);
}
