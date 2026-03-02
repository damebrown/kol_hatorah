import { getConfig, createLogger, createQdrantClient } from "@kol-hatorah/core";
import { getSQLiteManager } from "../../storage/sqlite";

export async function deleteCommentaryEnglishCommand() {
  const config = getConfig();
  const logger = createLogger(config);

  // SQLite: delete type=tanakh_commentary AND lang=en
  const sqlite = await getSQLiteManager();
  const sqliteDeleted = sqlite.deleteSegmentsByTypeAndLang("tanakh_commentary", "en");
  sqlite.close();
  logger.info({ deleted: sqliteDeleted }, "SQLite: deleted English commentary segments");

  // Qdrant: scroll type=tanakh_commentary, filter by sourcePath containing "/English/", delete by IDs
  const client = createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey });
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const idsToDelete: (string | number)[] = [];
  let nextOffset: string | number | Record<string, unknown> | null = null;
  do {
    const res = await client.scroll(collectionName, {
      filter: { must: [{ key: "type", match: { value: "tanakh_commentary" } }] },
      limit: 500,
      offset: nextOffset ?? undefined,
      with_payload: true,
      with_vector: false,
    });
    for (const p of res.points) {
      const sp = (p.payload as any)?.sourcePath;
      if (typeof sp === "string" && sp.includes("/English/")) {
        idsToDelete.push(p.id);
      }
    }
    nextOffset = res.next_page_offset ?? null;
  } while (nextOffset);

  if (idsToDelete.length > 0) {
    await client.delete(collectionName, { points: idsToDelete, wait: true });
    logger.info({ deleted: idsToDelete.length }, "Qdrant: deleted English commentary points");
  } else {
    logger.info("Qdrant: no English commentary points found");
  }

  logger.info({ sqlite: sqliteDeleted, qdrant: idsToDelete.length }, "✅ Deleted English commentary chunks");
  process.exit(0);
}
