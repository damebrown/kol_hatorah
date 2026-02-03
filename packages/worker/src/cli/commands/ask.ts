import {
  buildRagPrompt,
  Chunk,
  Citation,
  createLogger,
  createQdrantClient,
  deduplicateCitations,
  displayCitation,
  formatCitations,
  getConfig,
  normalizeText,
  OpenAIService,
  searchByVector,
  shouldAnswer,
  TextType,
} from "@kol-hatorah/core";
import minimist from "minimist";
import { getSQLiteManager } from "../sqlite";

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

export async function askOnce(params: {
  query: string;
  limit: number;
  type?: TextType;
  work?: string;
  jsonOutput?: boolean;
}): Promise<AskOnceResult> {
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
      }

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
  const searchResults = await searchByVector(qdrantClient, collectionName, queryEmbedding, {
    limit,
    type,
    work,
    source: undefined,
    lang: "he",
  });

  const chunks = searchResults.map((r) => r.chunk);
  const scores = searchResults.map((r) => r.score);

  const refused = !shouldAnswer(chunks, scores, config);
  if (refused) {
    const refusalMessage =
      "אני מצטער, אך אין לי מספיק מידע רלוונטי כדי לענות על שאלתך מהמקורות הזמינים לי. אנא נסה שאלה אחרת או הרחב את החיפוש שלך.";
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
