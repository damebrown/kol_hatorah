import minimist from "minimist";
import { createLogger, getConfig } from "@kol-hatorah/core";
import { runMetadataEnrichment } from "../../enrich/metadataEnrichment";

export async function enrichMetadataCommand() {
  const argv = minimist(process.argv.slice(2));
  const corporaRaw = String(argv.corpora || argv.c || "all").toLowerCase();
  const limit = parseInt(String(argv.limit ?? "0"), 10) || 0;
  const dryRun = Boolean(argv["dry-run"] || argv.dryRun);
  const resume = Boolean(argv.resume);
  const batchSizeRaw = parseInt(String(argv["batch-size"] ?? "50"), 10);
  const concurrencyRaw = parseInt(String(argv.concurrency ?? "3"), 10);
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;

  if (!["tanakh", "mishnah", "all"].includes(corporaRaw)) {
    console.error('Invalid --corpora: use "tanakh", "mishnah", or "all".');
    process.exit(1);
  }

  const config = getConfig();
  const logger = createLogger(config);

  await runMetadataEnrichment({
    corpora: corporaRaw as "tanakh" | "mishnah" | "all",
    limit,
    dryRun,
    resume,
    batchSize: batchSizeRaw > 0 ? batchSizeRaw : 50,
    concurrency: concurrencyRaw > 0 ? concurrencyRaw : 3,
    doQdrant,
    logger,
  });

  process.exit(0);
}
