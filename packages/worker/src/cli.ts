import { getConfig, createLogger, createQdrantClient, ensureCollection, upsertChunksWithVectors, searchByVector, TextType, OpenAIService, buildRagPrompt, shouldAnswer, deduplicateCitations, formatCitations, Chunk, createChunkId, Citation } from "@kol-hatorah/core";
import { getFakeChunks } from "./fakeCorpus";
import minimist from "minimist";
import path from "path";
import fs from "fs/promises";

const SEFARIA_CHECKPOINT_FILE = ".checkpoints/sefaria-taste.json";

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

async function ingestFakeEmbCommand() {
  const config = getConfig();
  const logger = createLogger(config);
  const qdrantClient = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });
  const openaiService = new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel);

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info({ collectionName }, "Generating embeddings for fake chunks and ingesting into Qdrant...");

  logger.info("Generating fake chunks...");
  const fakeChunks = getFakeChunks();
  logger.info({ count: fakeChunks.length }, "Generated fake chunks.");

  logger.info("Embedding fake chunk texts...");
  const chunkTexts = fakeChunks.map((c: Chunk) => c.text);
  const embeddings = await openaiService.embedTexts(chunkTexts);
  logger.info({ count: embeddings.length }, "Embeddings generated.");

  if (embeddings.length === 0) {
    logger.error("No embeddings generated. Cannot proceed with ingestion.");
    process.exit(1);
  }

  const vectorSize = embeddings[0].length;
  await ensureCollection(qdrantClient, collectionName, vectorSize);
  logger.info("✓ Chunks collection ensured.");

  logger.info("Upserting fake chunks with embeddings into Qdrant...");
  await upsertChunksWithVectors(qdrantClient, collectionName, fakeChunks, embeddings);
  logger.info({ count: fakeChunks.length }, "✓ Chunks upserted successfully.");
  process.exit(0);
}

async function askCommand() {
  const argv = minimist(process.argv.slice(2));
  const query = argv.q || argv.query;
  const limit = parseInt(argv.k || argv.limit || getConfig().rag.topK.toString(), 10);
  const type = argv.type as TextType | undefined;
  const work = argv.work as string | undefined;
  const jsonOutput = !!argv.json;

  if (!query) {
    console.error("Error: --q argument is required for ask command.");
    process.exit(1);
  }

  const config = getConfig();
  const logger = createLogger(config);
  const qdrantClient = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });
  const openaiService = new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel);

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info("Embedding question...");
  const queryEmbedding = (await openaiService.embedTexts([query]))[0];
  if (!queryEmbedding) {
    logger.error("Failed to embed query.");
    process.exit(1);
  }

  logger.info({ collectionName, limit, type, work }, "Searching Qdrant chunks collection...");
  const searchResults = await searchByVector(qdrantClient, collectionName, queryEmbedding, { limit, type, work, source: "fake", lang: "he" });

  const chunks = searchResults.map(r => r.chunk);
  const scores = searchResults.map(r => r.score);

  if (!shouldAnswer(chunks, scores, config)) {
    const refusalMessage = "אני מצטער, אך אין לי מספיק מידע רלוונטי כדי לענות על שאלתך מהמקורות הזמינים לי. אנא נסה שאלה אחרת או הרחב את החיפוש שלך.";
    if (jsonOutput) {
      console.log(JSON.stringify({ answer: refusalMessage, citations: [], usedChunks: [], model: config.openai.chatModel, tokens: 0, latencyMs: 0 }, null, 2));
    } else {
      console.log(refusalMessage);
      console.log("ציטוטים: אין");
    }
    process.exit(0);
  }

  logger.info({ count: chunks.length }, "Building RAG prompt...");
  const { instructions, input } = buildRagPrompt(query, chunks);

  logger.info({ model: config.openai.chatModel }, "Getting response from OpenAI...");
  const startTime = Date.now();
  const openaiResponse = await openaiService.getResponse({ model: config.openai.chatModel, instructions, input });
  const latencyMs = Date.now() - startTime;

  const citations = deduplicateCitations(chunks);
  const formattedCitations = formatCitations(citations);

  if (jsonOutput) {
    console.log(JSON.stringify({
      answer: openaiResponse.text,
      citations: citations.map((c: Citation) => `${c.work} ${c.ref}`),
      usedChunks: chunks.map((c: Chunk) => ({ id: c.id, work: c.work, ref: c.ref, textPreview: c.text.substring(0, 100) + "..." })),
      model: config.openai.chatModel,
      tokens: openaiResponse.usage?.total_tokens || 0,
      latencyMs,
    }, null, 2));
  } else {
    console.log(`תשובה:\n${openaiResponse.text}\n`);
    console.log(`ציטוטים: ${formattedCitations || "אין"}\n`);
  }
  process.exit(0);
}

async function ingestSefariaTasteCommand() {
  const argv = minimist(process.argv.slice(2));
  const reset = !!argv.reset;
  const limitChunks = parseInt(argv.limit || "0", 10);

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot ingest Sefaria taste.");
    process.exit(1);
  }

  const qdrantClient = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });
  const openaiService = new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel);

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info({ collectionName }, "Ingesting Sefaria taste data...");

  // Checkpoint mechanism
  const checkpointFilePath = path.join(process.cwd(), SEFARIA_CHECKPOINT_FILE);
  let checkpoint: Record<string, string> = {};
  if (!reset) {
    try {
      const checkpointData = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(checkpointData);
      logger.info({ checkpoint }, "Loaded ingestion checkpoint.");
    } catch (e) {
      logger.warn("No existing Sefaria ingestion checkpoint found.");
    }
  }

  const textsToProcess: { filePath: string; work: string; type: TextType; startRef?: string }[] = [
    { filePath: path.join(config.sefariaExportPath, "Tanakh", "Genesis.json"), work: "Genesis", type: "tanakh", startRef: checkpoint["tanakh|Genesis"] },
    { filePath: path.join(config.sefariaExportPath, "Mishnah", "Avot.json"), work: "Avot", type: "mishnah", startRef: checkpoint["mishnah|Avot"] },
    { filePath: path.join(config.sefariaExportPath, "Talmud", "Bavli", "Berakhot.json"), work: "Berakhot", type: "bavli", startRef: checkpoint["bavli|Berakhot"] },
  ];

  let ingestedCount = 0;
  for (const { filePath, work, type, startRef } of textsToProcess) {
    if (limitChunks > 0 && ingestedCount >= limitChunks) break;

    logger.info(`Processing ${type}: ${work} from ${filePath}...`);

    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      const sefariaData = JSON.parse(fileContent);
      let chunksToUpsert: Chunk[] = [];
      let textsToEmbed: string[] = [];

      // Minimal Sefaria parsing logic - this will be highly dependent on actual Sefaria export structure
      // This is a placeholder and will need refinement based on inspecting actual data
      if (sefariaData.text) { // Assuming a simple text structure
        const processText = (textArray: any[], currentRef: string[]) => {
          let currentText = "";
          for (const item of textArray) {
            if (typeof item === "string") {
              currentText += item + " ";
              // Simple chunking for now: if text is too long or a new verse/paragraph
              if (currentText.length > 200) { // Aim for ~200-500 chars
                // For Bavli, attempt to split by sentences/short paragraphs
                const sentences = currentText.split(/[.?!]/).filter(s => s.trim().length > 0);
                for (const sentence of sentences) {
                  if (sentence.length > 50) { // Only chunk if sentence is reasonably long
                    const chunkText = sentence.trim();
                    const chunk: Chunk = {
                      id: "", // Filled later
                      text: chunkText,
                      source: "sefaria",
                      type,
                      work,
                      ref: currentRef.join(":"),
                      normalizedRef: currentRef.join(":"),
                      lang: "he",
                      createdAt: new Date().toISOString(),
                      versionTitle: sefariaData.versionTitle || "Sefaria",
                      license: sefariaData.license || "CC-BY-NC",
                      attribution: sefariaData.attribution || "Sefaria",
                      url: sefariaData.url || `https://www.sefaria.org/${work}.${currentRef.join(".")}`,
                    };
                    // Update ID after all other fields are set
                    chunk.id = createChunkId({ source: chunk.source, ref: chunk.ref, lang: chunk.lang, text: chunk.text });
                    chunksToUpsert.push(chunk);
                    textsToEmbed.push(chunkText);
                    ingestedCount++;
                    checkpoint[`${type}|${work}`] = chunk.ref; // Update checkpoint with actual ref
                    if (limitChunks > 0 && ingestedCount >= limitChunks) break;
                  }
                }
                currentText = ""; // Reset after chunking
              } else if (currentText.length > 0) {
                 const chunk: Chunk = {
                    id: "", // Filled later
                    text: currentText.trim(),
                    source: "sefaria",
                    type,
                    work,
                    ref: currentRef.join(":"),
                    normalizedRef: currentRef.join(":"),
                    lang: "he",
                    createdAt: new Date().toISOString(),
                    versionTitle: sefariaData.versionTitle || "Sefaria",
                    license: sefariaData.license || "CC-BY-NC",
                    attribution: sefariaData.attribution || "Sefaria",
                    url: sefariaData.url || `https://www.sefaria.org/${work}.${currentRef.join(".")}`,
                  };
                  chunk.id = createChunkId({ source: chunk.source, ref: chunk.ref, lang: chunk.lang, text: chunk.text });
                  chunksToUpsert.push(chunk);
                  textsToEmbed.push(chunk.text);
                  ingestedCount++;
                  checkpoint[`${type}|${work}`] = chunk.ref; // Update checkpoint with actual ref
                  if (limitChunks > 0 && ingestedCount >= limitChunks) break;
                  currentText = "";
              }
            } else if (Array.isArray(item)) {
              processText(item, [...currentRef, (currentRef.length + 1).toString()]); // Recursive call for nested arrays
            }
            if (limitChunks > 0 && ingestedCount >= limitChunks) break;
          }
        }

        // Simplified parsing for Genesis 1-3, Avot 1, Berakhot 2a-5a
        if (type === "tanakh" && work === "Genesis") {
          for (let chapter = 1; chapter <= 3; chapter++) {
            if (sefariaData.text[chapter - 1]) {
              let verseNum = 1;
              for (const verseText of sefariaData.text[chapter - 1]) {
                const ref = `${work} ${chapter}:${verseNum}`;
                if (startRef && ref <= startRef) { verseNum++; continue; }

                const chunk: Chunk = {
                  id: "",
                  text: verseText,
                  source: "sefaria",
                  type,
                  work,
                  ref,
                  normalizedRef: ref,
                  lang: "he",
                  section: chapter.toString(),
                  segment: verseNum.toString(),
                  createdAt: new Date().toISOString(),
                  versionTitle: sefariaData.versionTitle || "Sefaria",
                  license: sefariaData.license || "CC-BY-NC",
                  attribution: sefariaData.attribution || "Sefaria",
                  url: sefariaData.url || `https://www.sefaria.org/${work}.${chapter}.${verseNum}`,
                };
                chunk.id = createChunkId({ source: chunk.source, ref: chunk.ref, lang: chunk.lang, text: chunk.text });
                chunksToUpsert.push(chunk);
                textsToEmbed.push(verseText);
                ingestedCount++;
                checkpoint[`${type}|${work}`] = ref;
                if (limitChunks > 0 && ingestedCount >= limitChunks) break;
                verseNum++;
              }
            }
            if (limitChunks > 0 && ingestedCount >= limitChunks) break;
          }
        } else if (type === "mishnah" && work === "Avot") {
          for (let chapter = 1; chapter <= 1; chapter++) { // Avot chapter 1
            if (sefariaData.text[chapter - 1]) {
              let mishnahNum = 1;
              for (const mishnahText of sefariaData.text[chapter - 1]) {
                const ref = `${work} ${chapter}:${mishnahNum}`;
                if (startRef && ref <= startRef) { mishnahNum++; continue; }

                const chunk: Chunk = {
                  id: "",
                  text: mishnahText,
                  source: "sefaria",
                  type,
                  work,
                  ref,
                  normalizedRef: ref,
                  lang: "he",
                  section: chapter.toString(),
                  segment: mishnahNum.toString(),
                  createdAt: new Date().toISOString(),
                  versionTitle: sefariaData.versionTitle || "Sefaria",
                  license: sefariaData.license || "CC-BY-NC",
                  attribution: sefariaData.attribution || "Sefaria",
                  url: sefariaData.url || `https://www.sefaria.org/${work}.${chapter}.${mishnahNum}`,
                };
                chunk.id = createChunkId({ source: chunk.source, ref: chunk.ref, lang: chunk.lang, text: chunk.text });
                chunksToUpsert.push(chunk);
                textsToEmbed.push(mishnahText);
                ingestedCount++;
                checkpoint[`${type}|${work}`] = ref;
                if (limitChunks > 0 && ingestedCount >= limitChunks) break;
                mishnahNum++;
              }
            }
            if (limitChunks > 0 && ingestedCount >= limitChunks) break;
          }
        } else if (type === "bavli" && work === "Berakhot") {
          // Bavli parsing for Berakhot 2a-5a - simplified
          const dafStart = 2; // Assuming '2a' is chapter 2, first side
          const dafEnd = 5; // Assuming '5a' is chapter 5, first side

          for (let chapter = dafStart; chapter <= dafEnd; chapter++) {
            // Simplified: treat each top-level array element as a 'daf' or section
            if (sefariaData.text[chapter - 1]) {
              let segmentNum = 1;
              for (const segmentText of sefariaData.text[chapter - 1]) {
                if (typeof segmentText === "string" && segmentText.length > 50) { // Basic chunking
                  const ref = `${work} ${chapter}a:${segmentNum}`;
                  if (startRef && ref <= startRef) { segmentNum++; continue; }

                  const chunk: Chunk = {
                    id: "",
                    text: segmentText,
                    source: "sefaria",
                    type,
                    work,
                    ref,
                    normalizedRef: ref,
                    lang: "he",
                    section: chapter.toString(),
                    segment: segmentNum.toString(),
                    createdAt: new Date().toISOString(),
                    versionTitle: sefariaData.versionTitle || "Sefaria",
                    license: sefariaData.license || "CC-BY-NC",
                    attribution: sefariaData.attribution || "Sefaria",
                    url: sefariaData.url || `https://www.sefaria.org/${work}.${chapter}a.${segmentNum}`,
                  };
                  chunk.id = createChunkId({ source: chunk.source, ref: chunk.ref, lang: chunk.lang, text: chunk.text });
                  chunksToUpsert.push(chunk);
                  textsToEmbed.push(segmentText);
                  ingestedCount++;
                  checkpoint[`${type}|${work}`] = ref;
                  if (limitChunks > 0 && ingestedCount >= limitChunks) break;
                }
                segmentNum++;
              }
            }
            if (limitChunks > 0 && ingestedCount >= limitChunks) break;
          }
        }
      }

      if (chunksToUpsert.length > 0) {
        logger.info(`Embedding ${chunksToUpsert.length} chunks for ${work}...`);
        const embeddings = await openaiService.embedTexts(textsToEmbed);

        if (embeddings.length === 0) {
          logger.error("No embeddings generated. Skipping upsert.");
          continue;
        }

        const vectorSize = embeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);

        logger.info(`Upserting ${chunksToUpsert.length} chunks into ${collectionName}...`);
        await upsertChunksWithVectors(qdrantClient, collectionName, chunksToUpsert, embeddings);
        logger.info(`✓ ${chunksToUpsert.length} chunks upserted successfully for ${work}.`);

        // Save checkpoint
        await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
        await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
        logger.info("Checkpoint saved.");
      } else {
        logger.info(`No new chunks to upsert for ${work}.`);
      }
    } catch (error) {
      logger.error({ error }, `Error processing ${filePath}`);
    }
  }

  logger.info("✅ Sefaria taste ingestion complete.");
  process.exit(0);
}

async function sefariaInspectCommand() {
  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot inspect Sefaria export.");
    process.exit(1);
  }

  logger.info(`Inspecting Sefaria export at: ${config.sefariaExportPath}`);

  const textsToInspect: { filePath: string; work: string; type: TextType }[] = [
    { filePath: path.join(config.sefariaExportPath, "Tanakh", "Genesis.json"), work: "Genesis", type: "tanakh" },
    { filePath: path.join(config.sefariaExportPath, "Mishnah", "Avot.json"), work: "Avot", type: "mishnah" },
    { filePath: path.join(config.sefariaExportPath, "Talmud", "Bavli", "Berakhot.json"), work: "Berakhot", type: "bavli" },
  ];

  for (const { filePath, work, type } of textsToInspect) {
    logger.info(`\n--- Inspecting ${type}: ${work} (${filePath}) ---`);
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      const sefariaData = JSON.parse(fileContent);
      logger.info("Discovered Sefaria data structure:");
      console.log(JSON.stringify(sefariaData, null, 2).substring(0, 500) + "..."); // Print first 500 chars

      // Simple sample parsing and preview
      if (sefariaData.text) {
        logger.info("Sample parsed chunks:");
        let sampleCount = 0;
        // This is a very basic example; actual parsing will need to be robust.
        if (type === "tanakh" && work === "Genesis" && sefariaData.text[0] && sefariaData.text[0][0]) {
          console.log(`- Ref: Genesis 1:1, Text: ${sefariaData.text[0][0].substring(0, 100)}...`);
          sampleCount++;
        }
        if (type === "mishnah" && work === "Avot" && sefariaData.text[0] && sefariaData.text[0][0]) {
          console.log(`- Ref: Avot 1:1, Text: ${sefariaData.text[0][0].substring(0, 100)}...`);
          sampleCount++;
        }
        if (type === "bavli" && work === "Berakhot" && sefariaData.text[1] && typeof sefariaData.text[1][0] === "string") {
          console.log(`- Ref: Berakhot 2a:1 (sample), Text: ${sefariaData.text[1][0].substring(0, 100)}...`);
          sampleCount++;
        }
        if (sampleCount === 0) {
          logger.info("Could not extract sample chunks with current basic parser. Adjust parsing logic for inspection.");
        }
      }
    } catch (error) {
      logger.error({ error }, `Error inspecting ${filePath}`);
    }
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
} else if (command === "ingest-fake-emb") {
  ingestFakeEmbCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ask") {
  askCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ingest-sefaria-taste") {
  ingestSefariaTasteCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "sefaria-inspect") {
  sefariaInspectCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else {
  console.error(`Unknown command: ${command || "(none)"}`);
  console.error("Available commands:");
  console.error("  qdrant-smoke        - Test Qdrant Cloud connection");
  console.error("  ingest-fake-emb     - Ingest fake corpus with real embeddings into Qdrant");
  console.error("  ask                 - Query Qdrant with RAG answering");
  console.error("  ingest-sefaria-taste - Ingest Sefaria taste data into Qdrant");
  console.error("  sefaria-inspect     - Inspect Sefaria export data structure");
  process.exit(1);
}
