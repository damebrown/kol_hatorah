import { getConfig, createLogger, createQdrantClient, ensureChunksCollection, upsertChunks, searchChunks, TextType } from "@kol-hatorah/core";
import { getFakeChunks } from "./fakeCorpus";
import minimist from "minimist";

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
    const collectionName = `${config.qdrant.collectionPrefix}_smoke_test`; // Use a fixed name for smoke test
    logger.info({ collectionName }, "Ensuring Qdrant smoke test collection exists...");
    await ensureChunksCollection(client, collectionName);
    logger.info("✓ Smoke test collection ensured.");

    // Verify by listing collections
    logger.info("Listing existing collections...");
    const existingCollections = await client.getCollections();
    logger.info({ count: existingCollections.collections.length }, "Found existing collections");
    if (existingCollections.collections.length > 0) {
      logger.info({ collections: existingCollections.collections.map(c => c.name) }, "Collections:");
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

async function ingestFakeCommand() {
  const config = getConfig();
  const logger = createLogger(config);
  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v1`;
  logger.info({ collectionName }, "Deleting existing Qdrant chunks collection (if any)...");
  await client.deleteCollection(collectionName);
  logger.info({ collectionName }, "Ensuring Qdrant chunks collection exists...");
  await ensureChunksCollection(client, collectionName);
  logger.info("✓ Chunks collection ensured.");

  logger.info("Generating fake chunks...");
  const fakeChunks = getFakeChunks();
  logger.info({ count: fakeChunks.length }, "Generated fake chunks.");

  logger.info("Upserting fake chunks into Qdrant...");
  await upsertChunks(client, collectionName, fakeChunks);
  logger.info({ count: fakeChunks.length }, "✓ Chunks upserted successfully.");
  process.exit(0);
}

async function askRetrieveCommand() {
  const argv = minimist(process.argv.slice(2));
  const query = argv.q || argv.query;
  const limit = parseInt(argv.limit || "8", 10);
  const type = argv.type as TextType | undefined;
  const work = argv.work as string | undefined;
  const source = argv.source as string | undefined;
  const lang = "he"; // Fixed for now

  if (!query) {
    console.error("Error: --q argument is required for ask-retrieve command.");
    process.exit(1);
  }

  const config = getConfig();
  const logger = createLogger(config);
  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v1`;
  logger.info({ collectionName }, "Searching Qdrant chunks collection...");

  // Reinitialize client to ensure latest collection schema is fetched
  const freshClient = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  const results = await searchChunks(freshClient, collectionName, query, { limit, type, work, source, lang });

  if (results.length === 0) {
    logger.info("No results found.");
  } else {
    logger.info({ count: results.length }, "Found results:");
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. Score: ${result.score.toFixed(3)}\n   Type: ${result.chunk.type}\n   Work: ${result.chunk.work}\n   Ref: ${result.chunk.ref}\n   Text: ${result.chunk.text.substring(0, 140)}...\n`);
    });
  }
  process.exit(0);
}

// Main CLI entry point
const command = process.argv[2];

if (command === "qdrant-smoke") {
  qdrantSmokeTest().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ingest-fake") {
  ingestFakeCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ask-retrieve") {
  askRetrieveCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command || "(none)"}`);
  console.error("Available commands:");
  console.error("  qdrant-smoke  - Test Qdrant Cloud connection");
  console.error("  ingest-fake   - Ingest fake corpus into Qdrant");
  console.error("  ask-retrieve  - Query Qdrant with filters");
  process.exit(1);
}
