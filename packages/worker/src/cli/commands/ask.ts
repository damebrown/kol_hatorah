import minimist from "minimist";
import {
  getConfig,
  createLogger,
  createQdrantClient,
  buildRagPrompt,
  shouldAnswer,
  deduplicateCitations,
  formatCitations,
  displayCitation,
  TextType,
  Chunk,
  Citation,
  parseSplitRef,
  compareSplitRefs,
} from "@kol-hatorah/core";
import { normalizeText, OpenAIService, searchByVector } from "@kol-hatorah/core";
import { getSQLiteManager } from "../../storage/sqlite";
import { askOnce as askOnceApi } from "../../askOnce";
import { normalizeQueryInput } from "../utils/normalizeQuery";
import { SefariaGraphClient } from "../../rag/sefariaGraphClient";
import { graphAugmentRetrieval, type GraphAugmentationDebug } from "../../rag/graphAugmentRetrieval";

const MAX_EXPANDED_UNITS = 8;
const MAX_TOTAL_CHARS = 30000;

interface SQLiteManagerLike {
  getSegmentsByBaseRef: (baseRef: string, type: string) => Array<{ ref: string; textPlain: string; work: string; type: string; [k: string]: unknown }>;
}

export function expandSplitChunks(
  chunks: Chunk[],
  scores: number[],
  sqlite: SQLiteManagerLike
): { expandedChunks: Chunk[]; expandedScores: number[] } {
  const nonSplit: { chunk: Chunk; score: number }[] = [];
  const baseRefGroups = new Map<string, { chunks: Chunk[]; scores: number[] }>();

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const score = scores[i];
    const parsed = parseSplitRef(chunk.ref);
    if (!parsed.isSplit) {
      nonSplit.push({ chunk, score });
      continue;
    }
    const existing = baseRefGroups.get(parsed.baseRef) ?? { chunks: [], scores: [] };
    existing.chunks.push(chunk);
    existing.scores.push(score);
    baseRefGroups.set(parsed.baseRef, existing);
  }

  const merged: { chunk: Chunk; score: number }[] = [];

  for (const [_baseRef, { chunks: groupChunks, scores: groupScores }] of baseRefGroups) {
    const firstChunk = groupChunks[0];
    const baseRef = parseSplitRef(firstChunk.ref).baseRef;

    const rows = sqlite.getSegmentsByBaseRef(baseRef, firstChunk.type);
    if (rows.length === 0) {
      for (let i = 0; i < groupChunks.length; i++) {
        merged.push({ chunk: groupChunks[i], score: groupScores[i] });
      }
      continue;
    }

    const sorted = [...rows].sort((a, b) => compareSplitRefs(a.ref, b.ref));
    const mergedText = sorted.map((r) => r.textPlain).join("\n\n");

    const mergedChunk: Chunk = {
      ...firstChunk,
      ref: baseRef,
      normalizedRef: baseRef,
      text: mergedText,
    };
    const maxScore = Math.max(...groupScores);
    merged.push({ chunk: mergedChunk, score: maxScore });
  }

  let result = [...nonSplit, ...merged];
  result.sort((a, b) => b.score - a.score);

  if (result.length > MAX_EXPANDED_UNITS) {
    result = result.slice(0, MAX_EXPANDED_UNITS);
  }

  let totalChars = 0;
  const capped: typeof result = [];
  for (const item of result) {
    if (totalChars + item.chunk.text.length > MAX_TOTAL_CHARS) {
      const remaining = MAX_TOTAL_CHARS - totalChars;
      if (remaining <= 0) break;
      capped.push({
        chunk: { ...item.chunk, text: item.chunk.text.slice(0, remaining) },
        score: item.score,
      });
      totalChars = MAX_TOTAL_CHARS;
      break;
    }
    capped.push(item);
    totalChars += item.chunk.text.length;
  }

  return {
    expandedChunks: capped.map((r) => r.chunk),
    expandedScores: capped.map((r) => r.score),
  };
}

export interface RagRetrievalEvalRefRow {
  work: string;
  ref: string;
  normalizedRef: string;
  score: number;
  type: TextType;
}

/** Populated only when `evalCapture: true` on the RAG path (eval harness). */
export interface RagRetrievalEvalSnapshot {
  vectorTopK: RagRetrievalEvalRefRow[];
  afterExpandSplitChunks: RagRetrievalEvalRefRow[];
  graphAugmentation: GraphAugmentationDebug | null;
  /** Chunks/scores after vector → expandSplitChunks → optional graph, before shouldAnswer. */
  contextPool: RagRetrievalEvalRefRow[];
}

function evalRowFromChunk(chunk: Chunk, score: number): RagRetrievalEvalRefRow {
  return {
    work: chunk.work,
    ref: chunk.ref,
    normalizedRef: chunk.normalizedRef,
    score,
    type: chunk.type,
  };
}

export interface AskOnceResult {
  answer: string;
  citations: string[];
  formattedCitations: string;
  usedChunks: Array<{ id: string; work: string; ref: string; textPreview: string }>;
  model: string;
  tokens: number;
  latencyMs: number;
  refused: boolean;
  retrievalEval?: RagRetrievalEvalSnapshot;
}

export async function askOnce(params: {
  query: string;
  limit: number;
  type?: TextType;
  work?: string;
  jsonOutput?: boolean;
  /** When true, attach `retrievalEval` on the vector RAG path only (for offline eval). */
  evalCapture?: boolean;
  /** Skip lexical/ref shortcuts so vector RAG runs (e.g. graph eval harness). */
  forceRag?: boolean;
}): Promise<AskOnceResult> {
  const { query, limit, type, work, evalCapture, forceRag } = params;
  const config = getConfig();
  const logger = createLogger(config);

  const exactRefMatch = /^([A-Za-zא-ת ]+)\s+\d+:\d+/.test(query.trim());
  const keywordPattern = /(מופיעה|מופיעים|מופיע|מקומות שבהם מופיעה|היכן מופיעה|הבא את כל המופעים)/;

  if (!forceRag && (exactRefMatch || keywordPattern.test(query))) {
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

  let chunks = searchResults.map((r) => r.chunk);
  let scores = searchResults.map((r) => r.score);

  let retrievalEval: RagRetrievalEvalSnapshot | undefined;
  if (evalCapture) {
    retrievalEval = {
      vectorTopK: searchResults.map((r) => evalRowFromChunk(r.chunk, r.score)),
      afterExpandSplitChunks: [],
      graphAugmentation: null,
      contextPool: [],
    };
  }

  const sqlite = await getSQLiteManager();
  try {
    const expanded = expandSplitChunks(chunks, scores, sqlite);
    chunks = expanded.expandedChunks;
    scores = expanded.expandedScores;

    if (retrievalEval) {
      retrievalEval.afterExpandSplitChunks = chunks.map((c, i) => evalRowFromChunk(c, scores[i] ?? 0));
    }

    if (process.env.KOL_HATORAH_ENABLE_SEFARIA_GRAPH === "1") {
      try {
        const graphClient = new SefariaGraphClient(logger);
        const augmented = await graphAugmentRetrieval(chunks, scores, sqlite, logger, graphClient, {
          maxUnits: MAX_EXPANDED_UNITS,
          maxChars: MAX_TOTAL_CHARS,
        });
        chunks = augmented.chunks;
        scores = augmented.scores;
        if (retrievalEval) {
          retrievalEval.graphAugmentation = augmented.debug;
        }
        if (augmented.debug) {
          logger.info(
            {
              graphAugmentation: augmented.debug,
            },
            "Sefaria graph augmentation (rerank + expansion) applied"
          );
        }
      } catch (graphErr) {
        logger.warn(
          { err: graphErr instanceof Error ? graphErr.message : String(graphErr) },
          "Sefaria graph augmentation failed; using vector-expanded retrieval only"
        );
      }
    }
  } finally {
    sqlite.close();
  }

  if (retrievalEval) {
    retrievalEval.contextPool = chunks.map((c, i) => evalRowFromChunk(c, scores[i] ?? 0));
  }

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
      ...(retrievalEval ? { retrievalEval } : {}),
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
    ...(retrievalEval ? { retrievalEval } : {}),
  };
}

export async function askCommand() {
  const argv = minimist(process.argv.slice(2));
  const queryRaw = argv.q || argv.query;
  const jsonOutput = !!argv.json;
  const debug = !!argv.debug || !!argv["debug-reflink"];

  const normalizedQuery = normalizeQueryInput(queryRaw || "");

  if (!normalizedQuery) {
    console.error("Error: --q argument is required for ask command.");
    process.exit(1);
  }

  try {
    const result = await askOnceApi({ q: normalizedQuery, debug });
    if (jsonOutput) {
      console.log(JSON.stringify({ text: result.text, ...(result.debug != null ? { debug: result.debug } : {}) }, null, 2));
    } else {
      console.log(result.text);
      if (debug && result.debug) {
        console.error("\n[Debug]", JSON.stringify(result.debug, null, 2));
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}
