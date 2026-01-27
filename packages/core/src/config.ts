import { z } from "zod";

const ConfigSchema = z.object({
  qdrant: z.object({
    url: z.string().url("QDRANT_URL must be a valid URL"),
    apiKey: z.string().min(1, "QDRANT_API_KEY is required"),
    collectionPrefix: z.string().default("hebrag_dev"),
  }),
  log: z.object({
    level: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  }),
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
