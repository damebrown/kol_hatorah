import minimist from "minimist";
import { createLogger, getConfig } from "@kol-hatorah/core";
import { runTanakhCommentaryGraphEnrichment } from "../../enrich/tanakhCommentaryGraphEnrichment";

/**
 * Offline pass: optionally prune Tanakh commentary to five allowlisted commentators (SQLite + Qdrant),
 * then attach compact base-ref–oriented graph metadata from Sefaria (links + ref-topic-links).
 */
export async function tanakhCommentaryReduceAndGraphEnrichCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(String(argv.limit ?? "0"), 10) || 0;
  const dryRun = Boolean(argv["dry-run"] || argv.dryRun);
  const resume = Boolean(argv.resume);
  const batchSizeRaw = parseInt(String(argv["batch-size"] ?? "40"), 10);
  const concurrencyRaw = parseInt(String(argv.concurrency ?? "4"), 10);
  const noReduce = Boolean(argv["no-reduce"] || argv.noReduce);
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;

  const config = getConfig();
  const logger = createLogger(config);

  await runTanakhCommentaryGraphEnrichment({
    reduceCorpus: !noReduce,
    limit,
    dryRun,
    resume,
    batchSize: batchSizeRaw > 0 ? batchSizeRaw : 40,
    concurrency: concurrencyRaw > 0 ? concurrencyRaw : 4,
    doQdrant,
    logger,
  });

  process.exit(0);
}
