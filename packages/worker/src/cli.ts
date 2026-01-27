import { getConfig, createLogger, createQdrantClient, listCollections, createCollection, deleteCollection, collectionExists } from "@kol-hatorah/core";

async function qdrantSmokeTest() {
  const config = getConfig();
  const logger = createLogger(config);

  logger.info("Starting Qdrant Cloud smoke test...");
  logger.info({ url: config.qdrant.url }, "Connecting to Qdrant");

  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  try {
    // List existing collections
    logger.info("Listing existing collections...");
    const existingCollections = await listCollections(client);
    logger.info({ count: existingCollections.length }, "Found existing collections");
    if (existingCollections.length > 0) {
      logger.info({ collections: existingCollections }, "Collections:");
    }

    // Create a test collection
    const timestamp = Date.now();
    const testCollectionName = `${config.qdrant.collectionPrefix}_smoke_${timestamp}`;
    logger.info({ name: testCollectionName }, "Creating test collection...");

    await createCollection(client, {
      name: testCollectionName,
      vectorSize: 768,
      distance: "Cosine",
    });

    logger.info("✓ Collection created successfully");

    // Verify it exists
    logger.info("Verifying collection exists...");
    const exists = await collectionExists(client, testCollectionName);
    if (!exists) {
      throw new Error("Collection was created but does not exist when checked");
    }
    logger.info("✓ Collection verified");

    // List collections again to confirm
    const collectionsAfter = await listCollections(client);
    if (!collectionsAfter.includes(testCollectionName)) {
      throw new Error("Collection not found in list after creation");
    }
    logger.info("✓ Collection appears in collection list");

    // Delete the test collection
    logger.info("Deleting test collection...");
    await deleteCollection(client, testCollectionName);
    logger.info("✓ Collection deleted successfully");

    // Verify deletion
    const existsAfterDelete = await collectionExists(client, testCollectionName);
    if (existsAfterDelete) {
      throw new Error("Collection still exists after deletion");
    }
    logger.info("✓ Collection deletion verified");

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

// Main CLI entry point
const command = process.argv[2];

if (command === "qdrant-smoke") {
  qdrantSmokeTest().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command || "(none)"}`);
  console.error("Available commands:");
  console.error("  qdrant-smoke  - Test Qdrant Cloud connection");
  process.exit(1);
}
