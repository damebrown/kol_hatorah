import { createLogger, createQdrantClient, ensureCollection, getConfig } from "@kol-hatorah/core";

export async function qdrantSmokeTest() {
  const config = getConfig();
  const logger = createLogger(config);

  logger.info("Starting Qdrant Cloud smoke test...");
  logger.info({ url: config.qdrant.url }, "Connecting to Qdrant");

  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  try {
    const collectionName = `${config.qdrant.collectionPrefix}_smoke_test`; // Use a fixed name for smoke test
    logger.info({ collectionName }, "Ensuring Qdrant smoke test collection exists...");
    // For smoke test, we can allow recreation for simplicity
    try {
      await client.deleteCollection(collectionName);
      logger.info(`Collection ${collectionName} deleted for smoke test.`);
    } catch (e) {
      logger.warn(`Collection ${collectionName} did not exist or could not be deleted.`);
    }
    await ensureCollection(client, collectionName, 768); // Use fixed size for smoke test
    logger.info("✓ Smoke test collection ensured.");

    // Verify by listing collections
    logger.info("Listing existing collections...");
    const existingCollections = await client.getCollections();
    logger.info({ count: existingCollections.collections.length }, "Found existing collections");
    if (existingCollections.collections.length > 0) {
      logger.info({ collections: existingCollections.collections.map((c) => c.name) }, "Collections:");
    }

    // Delete the test collection
    logger.info("Deleting test collection...");
    await client.deleteCollection(collectionName);
    logger.info("✓ Collection deleted successfully");

    logger.info("✅ Smoke test passed! Qdrant Cloud connection is working.");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "❌ Smoke test failed");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}
