import {
  Chunk,
  createChunkId,
  createLogger,
  createQdrantClient,
  ensureCollection,
  getConfig,
  OpenAIService,
  TextType,
  upsertChunksWithVectors,
} from "@kol-hatorah/core";
import fs from "fs/promises";
import minimist from "minimist";
import path from "path";
import { SEFARIA_CHECKPOINT_FILE } from "../constants";

export async function ingestSefariaTasteCommand() {
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
    {
      filePath: path.join(config.sefariaExportPath, "Tanakh", "Genesis.json"),
      work: "Genesis",
      type: "tanakh",
      startRef: checkpoint["tanakh|Genesis"],
    },
    {
      filePath: path.join(config.sefariaExportPath, "Mishnah", "Avot.json"),
      work: "Avot",
      type: "mishnah",
      startRef: checkpoint["mishnah|Avot"],
    },
    {
      filePath: path.join(config.sefariaExportPath, "Talmud", "Bavli", "Berakhot.json"),
      work: "Berakhot",
      type: "bavli",
      startRef: checkpoint["bavli|Berakhot"],
    },
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
      if (sefariaData.text) {
        // Assuming a simple text structure
        const processText = (textArray: any[], currentRef: string[]) => {
          let currentText = "";
          for (const item of textArray) {
            if (typeof item === "string") {
              currentText += item + " ";
              // Simple chunking for now: if text is too long or a new verse/paragraph
              if (currentText.length > 200) {
                // Aim for ~200-500 chars
                // For Bavli, attempt to split by sentences/short paragraphs
                const sentences = currentText.split(/[.?!]/).filter((s) => s.trim().length > 0);
                for (const sentence of sentences) {
                  if (sentence.length > 50) {
                    // Only chunk if sentence is reasonably long
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
                    chunk.id = createChunkId({
                      type: chunk.type,
                      work: chunk.work,
                      normalizedRef: chunk.normalizedRef,
                      ref: chunk.ref,
                      lang: chunk.lang,
                      versionTitle: chunk.versionTitle,
                      source: chunk.source,
                    });
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
                chunk.id = createChunkId({
                  type: chunk.type,
                  work: chunk.work,
                  normalizedRef: chunk.normalizedRef,
                  ref: chunk.ref,
                  lang: chunk.lang,
                  versionTitle: chunk.versionTitle,
                  source: chunk.source,
                });
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
        };

        // Simplified parsing for Genesis 1-3, Avot 1, Berakhot 2a-5a
        if (type === "tanakh" && work === "Genesis") {
          for (let chapter = 1; chapter <= 3; chapter++) {
            if (sefariaData.text[chapter - 1]) {
              let verseNum = 1;
              for (const verseText of sefariaData.text[chapter - 1]) {
                const ref = `${work} ${chapter}:${verseNum}`;
                if (startRef && ref <= startRef) {
                  verseNum++;
                  continue;
                }

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
                chunk.id = createChunkId({
                  type: chunk.type,
                  work: chunk.work,
                  normalizedRef: chunk.normalizedRef,
                  ref: chunk.ref,
                  lang: chunk.lang,
                  versionTitle: chunk.versionTitle,
                  source: chunk.source,
                });
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
          for (let chapter = 1; chapter <= 1; chapter++) {
            // Avot chapter 1
            if (sefariaData.text[chapter - 1]) {
              let mishnahNum = 1;
              for (const mishnahText of sefariaData.text[chapter - 1]) {
                const ref = `${work} ${chapter}:${mishnahNum}`;
                if (startRef && ref <= startRef) {
                  mishnahNum++;
                  continue;
                }

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
                chunk.id = createChunkId({
                  type: chunk.type,
                  work: chunk.work,
                  normalizedRef: chunk.normalizedRef,
                  ref: chunk.ref,
                  lang: chunk.lang,
                  versionTitle: chunk.versionTitle,
                  source: chunk.source,
                });
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
                if (typeof segmentText === "string" && segmentText.length > 50) {
                  // Basic chunking
                  const ref = `${work} ${chapter}a:${segmentNum}`;
                  if (startRef && ref <= startRef) {
                    segmentNum++;
                    continue;
                  }

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
                  chunk.id = createChunkId({
                    type: chunk.type,
                    work: chunk.work,
                    normalizedRef: chunk.normalizedRef,
                    ref: chunk.ref,
                    lang: chunk.lang,
                    versionTitle: chunk.versionTitle,
                    source: chunk.source,
                  });
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
        } else {
          processText(sefariaData.text, [work]);
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
