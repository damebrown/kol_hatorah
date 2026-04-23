/**
 * A4 — Cohere embedding service
 *
 * Uses embed-multilingual-v3.0 (1024 dims).
 * Strips nikkud and taamim from text before embedding (Decision A).
 * Uses input_type: "search_document" during ingest, "search_query" at retrieval.
 */

import { CohereClient } from "cohere-ai";
import { EmbedOptions, EmbeddingService } from "./embedding";
import { sleep } from "./utils";

const COHERE_BATCH_SIZE = 96;        // Cohere allows up to 96 texts per request
const COHERE_MAX_CHARS = 900;        // ~512 tokens at Hebrew ~1.5 chars/token
const MAX_ATTEMPTS = 8;
const MAX_BACKOFF_MS = 30_000;
const RETRY_BUDGET_MS = 180_000;

// Strip nikkud (U+05B0–U+05C7) and taamim/cantillation (U+0591–U+05AF)
const RE_NIKUD_TAAMIM = /[\u0591-\u05C7]/g;

function stripVowels(text: string): string {
  return text.replace(RE_NIKUD_TAAMIM, "");
}

function isRetriable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /rate.?limit|429|503|timeout|ECONNRESET/i.test(msg);
}

export class CohereEmbeddingService implements EmbeddingService {
  readonly modelDim = 1024;
  private client: CohereClient;
  private model: string;

  constructor(apiKey: string, model = "embed-multilingual-v3.0") {
    this.client = new CohereClient({ token: apiKey });
    this.model = model;
  }

  private preprocessText(text: string): string {
    const stripped = stripVowels(text);
    // Hard-truncate to COHERE_MAX_CHARS — splitter in A5 prevents this in practice
    return stripped.length > COHERE_MAX_CHARS ? stripped.slice(0, COHERE_MAX_CHARS) : stripped;
  }

  private async embedBatch(batch: string[], inputType: "search_document" | "search_query"): Promise<number[][]> {
    const start = Date.now();
    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
      try {
        const response = await this.client.embed({
          model: this.model,
          texts: batch,
          inputType,
          embeddingTypes: ["float"],
        });
        const floats = (response.embeddings as any).float as number[][];
        if (!floats || floats.length !== batch.length) {
          throw new Error(`Cohere returned ${floats?.length ?? 0} embeddings for batch of ${batch.length}`);
        }
        return floats;
      } catch (err) {
        const elapsed = Date.now() - start;
        if (!isRetriable(err) || attempt >= MAX_ATTEMPTS - 1 || elapsed >= RETRY_BUDGET_MS) throw err;
        const backoff = Math.min(1000 * 2 ** attempt + Math.random() * 1000, MAX_BACKOFF_MS);
        console.warn(`[cohere] retry ${attempt + 1}/${MAX_ATTEMPTS} in ${(backoff / 1000).toFixed(1)}s`);
        await sleep(backoff);
        attempt++;
      }
    }
    throw new Error("[cohere] exceeded max attempts");
  }

  async embedTexts(texts: string[], opts?: EmbedOptions): Promise<number[][]> {
    const inputType = opts?.inputType ?? "search_document";
    const batchSize = opts?.batchSize ?? COHERE_BATCH_SIZE;
    const processed = texts.map((t) => this.preprocessText(t));
    const results: number[][] = [];
    for (let i = 0; i < processed.length; i += batchSize) {
      const batch = processed.slice(i, i + batchSize);
      const vecs = await this.embedBatch(batch, inputType);
      results.push(...vecs);
      console.log(`[cohere] embedded ${Math.min(i + batch.length, processed.length)}/${processed.length}`);
    }
    return results;
  }
}
