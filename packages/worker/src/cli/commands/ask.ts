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
} from "@kol-hatorah/core";
import { normalizeText, OpenAIService, searchByVector } from "@kol-hatorah/core";
import { getSQLiteManager } from "../../storage/sqlite";
import { planQuery, executePlan, renderResult, QueryIntent } from "../../queryPlanner";
import { normalizeQueryInput } from "../utils/normalizeQuery";

export interface AskOnceResult {
  answer: string;
  citations: string[];
  formattedCitations: string;
  usedChunks: Array<{ id: string; work: string; ref: string; textPreview: string }>;
  model: string;
  tokens: number;
  latencyMs: number;
  refused: boolean;
}

export async function askOnce(params: { query: string; limit: number; type?: TextType; work?: string; jsonOutput?: boolean }): Promise<AskOnceResult> {
  const { query, limit, type, work } = params;
  const config = getConfig();
  const logger = createLogger(config);

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

export async function askCommand() {
  const argv = minimist(process.argv.slice(2));
  const queryRaw = argv.q || argv.query;
  const limit = parseInt(argv.k || argv.limit || getConfig().rag.topK.toString(), 10);
  const offset = parseInt(argv.offset || "0", 10);
  const showTanakhText = argv["show-tanakh-text"] === true || argv["show-tanakh-text"] === "true";
  const showMishnahText = argv["show-mishnah-text"] === true || argv["show-mishnah-text"] === "true";
  const type = argv.type as TextType | undefined;
  const work = argv.work as string | undefined;
  const jsonOutput = !!argv.json;
  const debug = !!argv.debug;
  const userProvidedLimit = argv.k !== undefined || argv.limit !== undefined;

  const normalizedQuery = normalizeQueryInput(queryRaw || "");

  if (!normalizedQuery) {
    console.error("Error: --q argument is required for ask command.");
    process.exit(1);
  }

  try {
    const plan = await planQuery(normalizedQuery);

    const paginationLimit =
      plan.intent === QueryIntent.WORD_OCCURRENCES || plan.intent === QueryIntent.CORPUS_QUOTE_QUERY
        ? userProvidedLimit
          ? limit
          : plan.limits.maxResults
        : limit;

    const execResult = await executePlan(plan, normalizedQuery, {
      pagination: { limit: paginationLimit, offset },
      generalQaHandler: async (q: string) => {
        const result = await askOnce({
          query: q,
          limit,
          type,
          work,
          jsonOutput,
        });
        return {
          kind: "OK",
          answer: result.answer,
          citations: result.citations,
          formattedCitations: result.formattedCitations,
          plan,
        };
      },
    });
    if (debug) {
      console.error("Plan:", JSON.stringify(plan, null, 2));
    }
    if (jsonOutput) {
      console.log(JSON.stringify(execResult, null, 2));
    } else {
      if (plan.intent === QueryIntent.CORPUS_QUOTE_QUERY) {
        const { renderQuoteResultsPretty } = await import("../../quotes/renderQuoteResults");
        const pretty = renderQuoteResultsPretty(execResult, { showTanakhText, showMishnahText, limit: paginationLimit, offset });
        console.log(pretty);
      } else if (plan.intent === QueryIntent.WORD_OCCURRENCES) {
        const { renderWordOccurrencesPretty } = await import("../../planner/renderers/renderWordOccurrences");
        const pretty = renderWordOccurrencesPretty(execResult, { term: plan.term, limit: paginationLimit, offset });
        console.log(pretty);
      } else {
        console.log(renderResult(execResult));
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}
