import { getConfig, createLogger, createQdrantClient, ensureCollection, upsertChunksWithVectors, searchByVector, TextType, OpenAIService, buildRagPrompt, shouldAnswer, deduplicateCitations, formatCitations, Chunk, createChunkId, Citation, displayCitation } from "@kol-hatorah/core";
import minimist from "minimist";
import path from "path";
import fs from "fs/promises";
import { FindResult, findHebrewMergedFile, loadSefariaSegmentsFromMerged } from "./sefariaLoader";
import { qdrantDeleteByFilterCommand } from "./cli-extra";
import { getSQLiteManager } from "./sqlite";
import { normalizeText } from "@kol-hatorah/core";
import { randomUUID } from "crypto";

const SEFARIA_CHECKPOINT_FILE = ".checkpoints/sefaria-taste.json";
const SEFARIA_TANAKH_ALL_CHECKPOINT_FILE = ".checkpoints/sefaria-tanakh-all.json";
const SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE = ".checkpoints/sefaria-mishnah-all.json";
const ID_TEST_SAMPLES = [
  { type: "tanakh", work: "Genesis", normalizedRef: "Genesis 1:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
  { type: "mishnah", work: "Avot", normalizedRef: "Avot 1:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
  { type: "bavli", work: "Berakhot", normalizedRef: "Berakhot 3:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
];

interface AskOnceResult {
  answer: string;
  citations: string[];
  formattedCitations: string;
  usedChunks: Array<{ id: string; work: string; ref: string; textPreview: string }>;
  model: string;
  tokens: number;
  latencyMs: number;
  refused: boolean;
}

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

async function askOnce(params: { query: string; limit: number; type?: TextType; work?: string; jsonOutput?: boolean }): Promise<AskOnceResult> {
  const { query, limit, type, work } = params;
  const config = getConfig();
  const logger = createLogger(config);

  // Lightweight router: exact ref or keyword "where appears" → skip embeddings and use SQLite
  const exactRefMatch = /^([A-Za-zא-ת ]+)\s+\d+:\d+/.test(query.trim());
  const keywordPattern = /(מופיעה|מופיעים|מופיע|מקומות שבהם מופיעה|היכן מופיעה|הבא את כל המופעים)/;

  if (exactRefMatch || keywordPattern.test(query)) {
    const sqlite = await getSQLiteManager();
    try {
      if (exactRefMatch) {
        const refNorm = query.trim();
        const row = sqlite.getRef(refNorm);
        if (!row) {
          return {
            answer: "לא נמצא טקסט עבור ההפניה המבוקשת.",
            citations: [],
            formattedCitations: "",
            usedChunks: [],
            model: "lexical",
            tokens: 0,
            latencyMs: 0,
            refused: true,
          };
        }
        return {
          answer: row.textPlain,
          citations: [`${row.work} ${row.ref}`],
          formattedCitations: `${row.work} ${row.ref}`,
          usedChunks: [{ id: row.id, work: row.work, ref: row.ref, textPreview: row.textPlain.substring(0, 100) + "..." }],
          model: "lexical",
          tokens: 0,
          latencyMs: 0,
          refused: false,
        };
      } else {
        const norm = normalizeText(query);
        const rows = sqlite.findTerm(norm.textNorm, { type, work }, limit);
        if (!rows.length) {
          return {
            answer: "לא נמצאו מופעים למונח המבוקש.",
            citations: [],
            formattedCitations: "",
            usedChunks: [],
            model: "lexical",
            tokens: 0,
            latencyMs: 0,
            refused: true,
          };
        }
        const hits = rows.map((r: any) => {
          const termPlain = query.trim().split(" ")[0];
          const idx = r.textPlain.indexOf(termPlain);
          const start = Math.max(0, idx >= 0 ? idx - 40 : 0);
          const end = Math.min(r.textPlain.length, start + 80);
          const snippet = r.textPlain.slice(start, end);
          return {
            ref: r.ref,
            work: r.work,
            type: r.type,
            snippet,
          };
        });
        return {
          answer: hits.map((h, i) => `[${i + 1}] ${h.work} ${h.ref}: ${h.snippet}`).join("\n"),
          citations: hits.map((h) => `${h.work} ${h.ref}`),
          formattedCitations: hits.map((h, i) => `[${i + 1}] ${h.work} ${h.ref}`).join(", "),
          usedChunks: hits.map((h) => ({ id: "", work: h.work, ref: h.ref, textPreview: h.snippet })),
          model: "lexical",
          tokens: 0,
          latencyMs: 0,
          refused: false,
        };
      }
    } finally {
      sqlite.close();
    }
  }

  const qdrantClient = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });
  const openaiService = new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel);

  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info("Embedding question...");
  const queryEmbedding = (await openaiService.embedTexts([query]))[0];
  if (!queryEmbedding) {
    throw new Error("Failed to embed query.");
  }

  logger.info({ collectionName, limit, type, work }, "Searching Qdrant chunks collection...");
  const searchResults = await searchByVector(qdrantClient, collectionName, queryEmbedding, { limit, type, work, source: undefined, lang: "he" });

  const chunks = searchResults.map((r) => r.chunk);
  const scores = searchResults.map((r) => r.score);

  const refused = !shouldAnswer(chunks, scores, config);
  if (refused) {
    const refusalMessage = "אני מצטער, אך אין לי מספיק מידע רלוונטי כדי לענות על שאלתך מהמקורות הזמינים לי. אנא נסה שאלה אחרת או הרחב את החיפוש שלך.";
    return {
      answer: refusalMessage,
      citations: [],
      formattedCitations: "",
      usedChunks: [],
      model: config.openai.chatModel,
      tokens: 0,
      latencyMs: 0,
      refused: true,
    };
  }

  logger.info({ count: chunks.length }, "Building RAG prompt...");
  const { instructions, input } = buildRagPrompt(query, chunks);

  logger.info({ model: config.openai.chatModel }, "Getting response from OpenAI...");
  const startTime = Date.now();
  const openaiResponse = await openaiService.getResponse({ model: config.openai.chatModel, instructions, input });
  const latencyMs = Date.now() - startTime;

  const citations = deduplicateCitations(chunks);
  const formattedCitations = formatCitations(citations);

  return {
    answer: openaiResponse.text,
    citations: citations.map((c: Citation) => displayCitation(c)),
    formattedCitations,
    usedChunks: chunks.map((c: Chunk) => ({ id: c.id, work: c.work, ref: c.ref, textPreview: c.text.substring(0, 100) + "..." })),
    model: config.openai.chatModel,
    tokens: openaiResponse.usage?.total_tokens || 0,
    latencyMs,
    refused: false,
  };
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

  try {
    const result = await askOnce({
      query,
      limit,
      type,
      work,
      jsonOutput,
    });
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`תשובה:\n${result.answer}\n`);
      console.log(`ציטוטים: ${result.formattedCitations || "אין"}\n`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
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
                    chunk.id = createChunkId({ type: chunk.type, work: chunk.work, normalizedRef: chunk.normalizedRef, ref: chunk.ref, lang: chunk.lang, versionTitle: chunk.versionTitle, source: chunk.source });
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
                  chunk.id = createChunkId({ type: chunk.type, work: chunk.work, normalizedRef: chunk.normalizedRef, ref: chunk.ref, lang: chunk.lang, versionTitle: chunk.versionTitle, source: chunk.source });
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
                chunk.id = createChunkId({ type: chunk.type, work: chunk.work, normalizedRef: chunk.normalizedRef, ref: chunk.ref, lang: chunk.lang, versionTitle: chunk.versionTitle, source: chunk.source });
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
                chunk.id = createChunkId({ type: chunk.type, work: chunk.work, normalizedRef: chunk.normalizedRef, ref: chunk.ref, lang: chunk.lang, versionTitle: chunk.versionTitle, source: chunk.source });
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
                  chunk.id = createChunkId({ type: chunk.type, work: chunk.work, normalizedRef: chunk.normalizedRef, ref: chunk.ref, lang: chunk.lang, versionTitle: chunk.versionTitle, source: chunk.source });
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

async function evalQueriesCommand() {
  const argv = minimist(process.argv.slice(2));
  const file = argv.file || argv.f || path.join(process.cwd(), "packages/worker/eval/queries.json");
  const limit = parseInt(argv.k || argv.limit || getConfig().rag.topK.toString(), 10);
  const outPath = argv.out || argv.o;

  let queries: Array<{ q: string; expectedRefs?: string[]; shouldRefuse?: boolean }> = [];
  try {
    const raw = await fs.readFile(file, "utf8");
    queries = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read queries file:", file, e);
    process.exit(1);
  }

  const results: any[] = [];
  for (const q of queries) {
    const started = Date.now();
    const res = await askOnce({ query: q.q, limit, jsonOutput: true });
    const latencyMs = Date.now() - started;

    let matchedRefs: string[] = [];
    if (q.expectedRefs && res.citations) {
      const citeSet = new Set(res.citations);
      matchedRefs = q.expectedRefs.filter((r) => citeSet.has(r));
    }

    results.push({
      query: q.q,
      expectedRefs: q.expectedRefs || [],
      shouldRefuse: q.shouldRefuse || false,
      refused: res.refused,
      answer: res.answer,
      citations: res.citations,
      usedChunks: res.usedChunks,
      model: res.model,
      tokens: res.tokens,
      latencyMs: res.latencyMs || latencyMs,
      matchedRefs,
    });
  }

  const report = { count: results.length, results };
  if (outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  process.exit(0);
}

async function lexFindCommand() {
  const argv = minimist(process.argv.slice(2));
  const term = argv.term || argv.t;
  const scope = argv.scope;
  const work = argv.work;
  const limit = parseInt(argv.limit || "50", 10);
  const context = parseInt(argv.context || "80", 10);

  if (!term) {
    console.error("Error: --term is required");
    process.exit(1);
  }

  const sqlite = await getSQLiteManager();
  try {
    const norm = normalizeText(term);
    const rows = sqlite.findTerm(norm.textNorm, { type: scope, work }, limit);
    const total = sqlite.countTerm(norm.textNorm, { type: scope, work });
    const hits = rows.map((r: any, idx: number) => {
      const idxTerm = r.textPlain.indexOf(term);
      const start = Math.max(0, idxTerm >= 0 ? idxTerm - Math.floor(context / 2) : 0);
      const end = Math.min(r.textPlain.length, start + context);
      const snippet = r.textPlain.slice(start, end);
      return {
        idx: idx + 1,
        work: r.work,
        ref: r.ref,
        type: r.type,
        snippet,
      };
    });
    console.log(JSON.stringify({ total, hits }, null, 2));
  } finally {
    sqlite.close();
  }
}

async function getRefCommand() {
  const argv = minimist(process.argv.slice(2));
  const ref = argv.ref;
  if (!ref) {
    console.error("Error: --ref is required");
    process.exit(1);
  }
  const sqlite = await getSQLiteManager();
  try {
    const row = sqlite.getRef(ref.trim());
    if (!row) {
      console.log(JSON.stringify({ found: false }));
    } else {
      console.log(JSON.stringify({ found: true, row }, null, 2));
    }
  } finally {
    sqlite.close();
  }
}

async function debugIdsCommand() {
  const ids1 = ID_TEST_SAMPLES.map((s) => createChunkId(s as any));
  const ids2 = ID_TEST_SAMPLES.map((s) => createChunkId(s as any));
  const same = ids1.every((id, idx) => id === ids2[idx]);
  console.log({ ids1, ids2, deterministic: same });
  if (!same) {
    throw new Error("ID generation is not deterministic across runs");
  }
}

async function ingestSefariaTanakhAllCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(argv.limit || "0", 10);
  const reset = !!argv.reset;
  const resetWork = argv["reset-work"] ? String(argv["reset-work"]).split(",").map((s: string) => s.trim()) : [];
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;
  const ingestedSummary: Array<{ work: string; path: string; destinations: string[] }> = [];

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot ingest Tanakh.");
    process.exit(1);
  }

  const listDirs = async (p: string) => {
    try {
      const entries = await fs.readdir(p, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  };

  const torahRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Torah");
  const prophetsRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Prophets");
  const writingsRoot = path.join(config.sefariaExportPath, "json", "Tanakh", "Writings");
  const torah = await listDirs(torahRoot);
  const prophets = await listDirs(prophetsRoot);
  const writings = await listDirs(writingsRoot);
  const tanakhTargets = [...torah, ...prophets, ...writings].map((w) => ({ type: "tanakh" as TextType, work: w, categoryGuess: "Tanakh" as const }));

  const allWorksSet = new Set(tanakhTargets.map((t) => t.work));
  const remainingWorks = [...allWorksSet];

  logger.info({
    discovered: allWorksSet.size,
    remaining: remainingWorks.length,
    remainingWorks,
  }, "Tanakh discovery summary");

  if (remainingWorks.length === 0) {
    logger.info("No remaining Tanakh works to ingest (all done or excluded).");
    process.exit(0);
  }

  const qdrantClient = doQdrant
    ? createQdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
      })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  logger.info({ collectionName, limit, doQdrant, doSqlite }, "Ingesting Tanakh...");

  const checkpointFilePath = path.join(process.cwd(), SEFARIA_TANAKH_ALL_CHECKPOINT_FILE);
  let checkpoint: Record<string, boolean> = {};
  if (!reset) {
    try {
      const checkpointData = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(checkpointData);
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded tanakh checkpoint.");
    } catch {
      logger.info("No tanakh checkpoint found; starting fresh.");
    }
  }

  let ingestedCount = 0;
  for (const work of remainingWorks) {
    if (limit > 0 && ingestedCount >= limit) break;
    if (resetWork.includes(work)) {
      delete checkpoint[work];
    }
    if (checkpoint[work]) {
      logger.info({ work }, "Skipping (already ingested in checkpoint).");
      continue;
    }

    const target: any = { type: "tanakh", work, categoryGuess: "Tanakh" };
    const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
    if (!findResult.filePath) {
      logger.warn({ work }, "No Hebrew merged file found in category root; skipping.");
      if (findResult.candidates.length) {
        logger.info({ candidates: findResult.candidates.slice(0, 5) }, "Closest candidates");
      }
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    logger.info({ work, mergedPath: findResult.filePath }, "Loading Sefaria segments...");
    const segments = await loadSefariaSegmentsFromMerged(findResult.filePath, target);
    if (!segments.length) {
      logger.warn({ work }, "No segments loaded; skipping.");
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    if (doSqlite) {
      const sqlite = await getSQLiteManager();
      try {
        sqlite.insertSegments(segments);
      } finally {
        sqlite.close();
      }
    }

    if (doQdrant && openaiService && qdrantClient) {
      const textsToEmbed = segments.map((c) => c.text);
      const embeddings = await openaiService.embedTexts(textsToEmbed);
      if (!embeddings.length) {
        logger.warn({ work: target.work }, "No embeddings generated; skipping Qdrant upsert.");
      } else {
        const vectorSize = embeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);

        const UPSERT_BATCH_SIZE = 32;
        for (let i = 0; i < segments.length; i += UPSERT_BATCH_SIZE) {
          const chunkBatch = segments.slice(i, i + UPSERT_BATCH_SIZE);
          const vectorBatch = embeddings.slice(i, i + UPSERT_BATCH_SIZE);
          await upsertChunksWithVectors(qdrantClient, collectionName, chunkBatch, vectorBatch);
        }
      }
    }

    ingestedCount += segments.length;
    checkpoint[work] = true;
    await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
    await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
    ingestedSummary.push({
      work,
      path: findResult.filePath,
      destinations: [
        ...(doSqlite ? ["sqlite"] : []),
        ...(doQdrant ? [collectionName] : []),
      ],
    });
    logger.info({ work, added: segments.length, totalIngested: ingestedCount }, "Ingested work and checkpoint saved.");

    if (limit > 0 && ingestedCount >= limit) break;
  }

  logger.info({ ingestedCount, ingestedSummary }, "✅ Tanakh ingestion complete.");
  process.exit(0);
}

async function ingestSefariaMishnahAllCommand() {
  const argv = minimist(process.argv.slice(2));
  const limit = parseInt(argv.limit || "0", 10);
  const reset = !!argv.reset;
  const resetWork = argv["reset-work"] ? String(argv["reset-work"]).split(",").map((s: string) => s.trim()) : [];
  const doQdrant = argv["qdrant"] !== false && argv["no-qdrant"] !== true;
  const doSqlite = argv["sqlite"] !== false && argv["no-sqlite"] !== true;
  const ingestedSummary: Array<{ work: string; path: string; destinations: string[] }> = [];

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot ingest Mishnah.");
    process.exit(1);
  }

  const listDirs = async (p: string) => {
    try {
      const entries = await fs.readdir(p, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  };

  const mishnahRoot = path.join(config.sefariaExportPath, "json", "Mishnah");
  const allowedSeders = new Set([
    "Seder Zeraim",
    "Seder Moed",
    "Seder Nashim",
    "Seder Nezikin",
    "Seder Kodashim",
    "Seder Tahorot",
  ]);
  const seders = (await listDirs(mishnahRoot)).filter((s) => allowedSeders.has(s));
  const tractateSet = new Set<string>();
  for (const seder of seders) {
    const sederPath = path.join(mishnahRoot, seder);
    const tractatesInSeder = await listDirs(sederPath);
    tractatesInSeder.forEach((t) => tractateSet.add(t));
  }
  const tractates = [...tractateSet];
  if (!tractates.length) {
    logger.warn("No Mishnah tractates discovered under json/Mishnah; nothing to ingest.");
    process.exit(0);
  }

  const qdrantClient = doQdrant
    ? createQdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
      })
    : null;
  const openaiService = doQdrant ? new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel) : null;
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  const checkpointFilePath = path.join(process.cwd(), SEFARIA_MISHNAH_ALL_CHECKPOINT_FILE);
  let checkpoint: Record<string, boolean> = {};
  if (!reset) {
    try {
      const checkpointData = await fs.readFile(checkpointFilePath, "utf8");
      checkpoint = JSON.parse(checkpointData);
      logger.info({ done: Object.keys(checkpoint).length }, "Loaded mishnah-all checkpoint.");
    } catch {
      logger.info("No mishnah-all checkpoint found; starting fresh.");
    }
  }

  let ingestedCount = 0;
  for (const work of tractates) {
    if (limit > 0 && ingestedCount >= limit) break;
    if (resetWork.includes(work)) {
      delete checkpoint[work];
    }
    if (checkpoint[work]) {
      logger.info({ work }, "Skipping (already ingested in checkpoint).");
      continue;
    }

    const target: any = { type: "mishnah", work, categoryGuess: "Mishnah" };
    const findResult = await findHebrewMergedFile(config.sefariaExportPath!, target);
    if (!findResult.filePath) {
      logger.warn({ work }, "No Hebrew merged file found in Mishnah root; skipping.");
      if (findResult.candidates.length) {
        logger.info({ candidates: findResult.candidates.slice(0, 5) }, "Closest candidates");
      }
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    logger.info({ work, mergedPath: findResult.filePath }, "Loading Mishnah segments...");
    const segments = await loadSefariaSegmentsFromMerged(findResult.filePath, target);
    if (!segments.length) {
      logger.warn({ work }, "No segments loaded; skipping.");
      checkpoint[work] = true;
      await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
      await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    if (doSqlite) {
      const sqlite = await getSQLiteManager();
      try {
        sqlite.insertSegments(segments);
      } finally {
        sqlite.close();
      }
    }

    if (doQdrant && openaiService && qdrantClient) {
      const textsToEmbed = segments.map((c) => c.text);
      const embeddings = await openaiService.embedTexts(textsToEmbed);
      if (!embeddings.length) {
        logger.warn({ work }, "No embeddings generated; skipping Qdrant upsert.");
      } else {
        const vectorSize = embeddings[0].length;
        await ensureCollection(qdrantClient, collectionName, vectorSize);

        const UPSERT_BATCH_SIZE = 32;
        for (let i = 0; i < segments.length; i += UPSERT_BATCH_SIZE) {
          const chunkBatch = segments.slice(i, i + UPSERT_BATCH_SIZE);
          const vectorBatch = embeddings.slice(i, i + UPSERT_BATCH_SIZE);
          await upsertChunksWithVectors(qdrantClient, collectionName, chunkBatch, vectorBatch);
        }
      }
    }

    ingestedCount += segments.length;
    checkpoint[work] = true;
    await fs.mkdir(path.dirname(checkpointFilePath), { recursive: true });
    await fs.writeFile(checkpointFilePath, JSON.stringify(checkpoint, null, 2));
    ingestedSummary.push({
      work,
      path: findResult.filePath,
      destinations: [
        ...(doSqlite ? ["sqlite"] : []),
        ...(doQdrant ? [collectionName] : []),
      ],
    });
    logger.info({ work, added: segments.length, totalIngested: ingestedCount }, "Ingested work and checkpoint saved.");

    if (limit > 0 && ingestedCount >= limit) break;
  }

  logger.info({ ingestedCount, ingestedSummary }, "✅ Mishnah all ingestion complete.");
  process.exit(0);
}

function flattenForInspect(text: any, work: string, type: TextType, pathParts: number[] = []): Array<{ ref: string; normalizedText: string }> {
  const out: Array<{ ref: string; normalizedText: string }> = [];
  if (Array.isArray(text)) {
    for (let i = 0; i < text.length; i++) {
      out.push(...flattenForInspect(text[i], work, type, [...pathParts, i + 1]));
    }
  } else if (typeof text === "string") {
    const t = text.trim();
    if (t.length > 0) {
      const ref =
        pathParts.length === 0
          ? work
          : pathParts.length === 1
          ? `${work} ${pathParts[0]}`
          : pathParts.length === 2
          ? `${work} ${pathParts[0]}:${pathParts[1]}`
          : `${work} ${pathParts.join(":")}`;
      out.push({ ref, normalizedText: t.replace(/<[^>]*>/g, "").trim() });
    }
  }
  return out;
}

async function sefariaInspectCommand() {
  const argv = minimist(process.argv.slice(2));
  const work = argv.work || argv.w || "Genesis";
  const category = argv.category || argv.c || "tanakh";
  const customPath = argv.path || argv.p;

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot inspect Sefaria export.");
    process.exit(1);
  }

  const target = { work, type: category as TextType, categoryGuess: category as any };
  let findResult: FindResult;
  if (customPath) {
    findResult = { filePath: customPath, candidates: [] };
  } else {
    findResult = await findHebrewMergedFile(config.sefariaExportPath, target as any);
  }

  if (!findResult.filePath) {
    logger.error("Could not find a Hebrew/merged.(json|txt) JSON for the requested work under the specified category root.");
    if (findResult.candidates.length) {
      console.error("Closest candidates:");
      console.error(findResult.candidates.slice(0, 5).join("\n"));
    }
    console.error("Provide --path to override if needed.");
    process.exit(1);
  }

  const mergedPath = findResult.filePath;

  logger.info(`Inspecting file: ${mergedPath}`);
  try {
    const raw = await fs.readFile(mergedPath, "utf8");
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Failed to parse as JSON. First 200 chars:");
      console.log(raw.slice(0, 200));
      process.exit(1);
    }

    const title = parsed?.title;
    const language = parsed?.language;
    const versionTitle = parsed?.versionTitle;
    const versionSource = parsed?.versionSource;
    const text = parsed?.text;

    console.log({ title, language, versionTitle, versionSource });

    const shape: number[] = [];
    function inspectShape(node: any, depth = 0) {
      if (Array.isArray(node)) {
        shape[depth] = Math.max(shape[depth] || 0, node.length);
        if (node.length > 0) inspectShape(node[0], depth + 1);
      }
    }
    inspectShape(text);
    console.log("Shape (max sizes per level):", shape);

    const flattened = text ? flattenForInspect(text, work as string, target.type) : [];
    console.log("First 5 leaf segments (ref + preview):");
    flattened.slice(0, 5).forEach((seg) => {
      console.log({ ref: seg.ref, preview: seg.normalizedText.slice(0, 120) });
    });
  } catch (error) {
    logger.error({ error }, "Error inspecting file");
    process.exit(1);
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
} else if (command === "ask") {
  askCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ingest-tanakh") {
  ingestSefariaTanakhAllCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "ingest-mishnah") {
  ingestSefariaMishnahAllCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "eval-queries") {
  evalQueriesCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "qdrant:delete-by-filter") {
  qdrantDeleteByFilterCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "lex-find") {
  lexFindCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "get-ref") {
  getRefCommand().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else if (command === "debug-ids") {
  debugIdsCommand().catch((error) => {
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
  console.error("  qdrant-smoke");
  console.error("  ask");
  console.error("  ingest-tanakh");
  console.error("  ingest-mishnah");
  console.error("  lex-find");
  console.error("  get-ref");
  console.error("  debug-ids");
  console.error("  eval-queries");
  console.error("  qdrant:delete-by-filter");
  console.error("  sefaria-inspect");
  process.exit(1);
}
