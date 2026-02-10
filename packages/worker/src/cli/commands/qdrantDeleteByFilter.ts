import { getConfig, createLogger, createQdrantClient } from "@kol-hatorah/core";
import minimist from "minimist";

export async function qdrantDeleteByFilterCommand() {
  const argv = minimist(process.argv.slice(2));
  const dryRun = !!argv["dry-run"];
  const type = argv.type as string | undefined;
  const works = argv.work ? String(argv.work).split(",").map((w: string) => w.trim()) : [];

  const config = getConfig();
  const logger = createLogger(config);
  const client = createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey });
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  if (!type && works.length === 0) {
    console.error("Specify at least --type or --work");
    process.exit(1);
  }

  const makeFilter = (work?: string) => {
    const must: any[] = [];
    if (type) must.push({ key: "type", match: { value: type } });
    if (work) must.push({ key: "work", match: { value: work } });
    return must.length ? { must } : { must: [] };
  };

  const targets = works.length ? works : [undefined];
  for (const w of targets) {
    const filter = makeFilter(w);
    let total = 0;
    let nextOffset: any = null;
    let sample: any = null;
    do {
      const res = await client.scroll(collectionName, {
        filter,
        limit: 100,
        offset: nextOffset || undefined,
        with_payload: !!dryRun,
        with_vector: false,
      });
      total += res.points.length;
      if (!sample && res.points.length) {
        sample = res.points[0];
      }
      nextOffset = res.next_page_offset;
    } while (nextOffset);

    if (dryRun) {
      logger.info({ work: w || "(any)", type: type || "(any)", total, samplePayload: sample?.payload }, "Dry run: would delete");
      continue;
    }

    logger.info({ work: w || "(any)", type: type || "(any)", total }, "Deleting by filter...");
    await client.delete(collectionName, { filter, wait: true });
    logger.info("Delete request issued.");
  }

  process.exit(0);
}
