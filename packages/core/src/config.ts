import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// Load .env from monorepo root regardless of cwd
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const ConfigSchema = z.object({
  qdrant: z.object({
    url: z.string().url("QDRANT_URL must be a valid URL"),
    apiKey: z.string().min(1, "QDRANT_API_KEY is required"),
    collectionPrefix: z.string().default("hebrag_dev"),
  }),
  log: z.object({
    level: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  }),
  openai: z.object({
    apiKey: z.string().min(1, "OPENAI_API_KEY is required"),
    embeddingModel: z.string().default("text-embedding-3-small"),
    chatModel: z.string().default("gpt-4o-mini"),
  }),
  rag: z.object({
    topK: z.coerce.number().int().min(1).default(8),
    minSources: z.coerce.number().int().min(1).default(2),
    minScore: z.coerce.number().min(0).optional(), // Truly optional, defaults to undefined
  }),
  sefariaExportPath: z.string().min(1, "SEFARIA_EXPORT_PATH is required for Sefaria ingestion").optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const raw = {
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionPrefix: process.env.QDRANT_COLLECTION_PREFIX || "hebrag_dev",
    },
    log: {
      level: (process.env.LOG_LEVEL || "info") as Config["log"]["level"],
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      chatModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    },
    rag: {
      topK: process.env.RAG_TOP_K ? parseInt(process.env.RAG_TOP_K, 10) : undefined,
      minSources: process.env.RAG_MIN_SOURCES ? parseInt(process.env.RAG_MIN_SOURCES, 10) : undefined,
      minScore: process.env.RAG_MIN_SCORE ? parseFloat(process.env.RAG_MIN_SCORE) : undefined,
    },
    sefariaExportPath: process.env.SEFARIA_EXPORT_PATH,
  };

  try {
    cachedConfig = ConfigSchema.parse(raw);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Configuration error:\n${messages}\n\nPlease check your .env file.`);
    }
    throw error;
  }
}
