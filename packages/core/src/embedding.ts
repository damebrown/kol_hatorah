/**
 * A4 — EmbeddingService abstraction
 *
 * Defines the shared interface for all embedding providers and the factory
 * that selects the right implementation based on EMBEDDING_PROVIDER.
 */

import { Config } from "./config";
import { OpenAIService } from "./openai";

export interface EmbedOptions {
  /** Cohere distinguishes ingest vs. query; OpenAI ignores this. */
  inputType?: "search_document" | "search_query";
  batchSize?: number;
}

export interface EmbeddingService {
  embedTexts(texts: string[], opts?: EmbedOptions): Promise<number[][]>;
  /** Dimensionality of the produced vectors. */
  readonly modelDim: number;
}

/** Returns the appropriate EmbeddingService based on EMBEDDING_PROVIDER config. */
export function createEmbeddingService(config: Config): EmbeddingService {
  const provider = config.embedding.provider;
  if (provider === "cohere") {
    const { CohereEmbeddingService } = require("./cohere");
    return new CohereEmbeddingService(config.embedding.cohereApiKey!, config.embedding.cohereModel);
  }
  // Default: OpenAI
  return new OpenAIServiceAdapter(
    new OpenAIService(config.openai.apiKey, config.openai.embeddingModel, config.openai.chatModel)
  );
}

/** Thin adapter so OpenAIService satisfies EmbeddingService without changing its public API. */
class OpenAIServiceAdapter implements EmbeddingService {
  readonly modelDim = 1536;
  constructor(private readonly svc: OpenAIService) {}
  embedTexts(texts: string[], opts?: EmbedOptions): Promise<number[][]> {
    return this.svc.embedTexts(texts, { batchSize: opts?.batchSize });
  }
}
