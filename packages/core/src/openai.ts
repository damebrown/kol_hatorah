import OpenAI from "openai";
import { sleep } from "./utils";

const MIN_REQUEST_INTERVAL_MS = parseInt(process.env.OPENAI_MIN_REQUEST_INTERVAL_MS || "800", 10);
const OPENAI_MAX_ATTEMPTS = parseInt(process.env.OPENAI_MAX_ATTEMPTS || "20", 10);
const OPENAI_RETRY_TIME_BUDGET_MS = parseInt(process.env.OPENAI_RETRY_TIME_BUDGET_MS || `${8 * 60 * 1000}`, 10); // default 8 minutes
const OPENAI_EMBED_BATCH_SIZE = parseInt(process.env.OPENAI_EMBED_BATCH_SIZE || "8", 10);
const MAX_BACKOFF_MS = 30_000;
const DEFAULT_RESPONSE_MAX_TOKENS = 500;
const DEFAULT_TEMPERATURE = 0.2;

let lastRequestTime = 0;

type RetriableStatus = 408 | 429 | 500 | 502 | 503 | 504;

function isRetriableStatus(status?: number): status is RetriableStatus {
  if (!status) return false;
  if (status === 408 || status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

function getRetryAfterMs(error: any): number | null {
  const retryAfter =
    error?.response?.headers?.["retry-after"] ||
    error?.response?.headers?.["Retry-After"] ||
    error?.headers?.["retry-after"] ||
    error?.headers?.["Retry-After"];
  if (!retryAfter) return null;
  const asNumber = Number(retryAfter);
  if (!Number.isNaN(asNumber)) {
    // Retry-After seconds as number
    return asNumber * 1000;
  }
  // HTTP-date not parsed; ignore
  return null;
}

async function throttledRequest<T>(
  label: string,
  fn: () => Promise<T>,
  opts?: { maxAttempts?: number }
): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? OPENAI_MAX_ATTEMPTS;
  const start = Date.now();
  let attempt = 0;

  while (attempt < maxAttempts) {
    const now = Date.now();
    const sinceLast = now - lastRequestTime;
    if (sinceLast < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - sinceLast);
    }

    try {
      const result = await fn();
      lastRequestTime = Date.now();
      return result;
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const elapsed = Date.now() - start;
      const remainingBudget = OPENAI_RETRY_TIME_BUDGET_MS - elapsed;

      if (!isRetriableStatus(status) || attempt >= maxAttempts - 1 || remainingBudget <= 0) {
        const reason = status ? `status ${status}` : "unknown error";
        throw new Error(
          `[${label}] failed after ${attempt + 1} attempts (${elapsed}ms). Reason: ${reason}. Original: ${error?.message || error}`
        );
      }

      const retryAfterHeaderMs = getRetryAfterMs(error);
      const backoffBase = Math.min(2 ** attempt * 1000, MAX_BACKOFF_MS);
      const jitter = Math.floor(Math.random() * 1000);
      const waitMs = retryAfterHeaderMs != null ? retryAfterHeaderMs : Math.min(backoffBase + jitter, MAX_BACKOFF_MS);
      const boundedWait = Math.min(waitMs, remainingBudget);

      console.warn(
        `[${label}] retry ${attempt + 1}/${maxAttempts} in ${(boundedWait / 1000).toFixed(1)}s (elapsed ${(elapsed / 1000).toFixed(1)}s, status ${status})`
      );
      await sleep(boundedWait);
      attempt++;
    }
  }

  throw new Error(`[${label}] exceeded maximum attempts (${maxAttempts}).`);
}

export interface EmbedTextsOptions {
  batchSize?: number;
}

export interface GetResponseParams {
  model: string;
  instructions: string;
  input: string;
  temperature?: number;
  max_tokens?: number;
}

export interface GetResponseResult {
  text: string;
  raw?: any;
  usage?: any;
}

export class OpenAIService {
  private openai: OpenAI;
  private embeddingModel: string;
  private chatModel: string;

  constructor(apiKey: string, embeddingModel: string, chatModel: string) {
    this.openai = new OpenAI({ apiKey });
    this.embeddingModel = embeddingModel;
    this.chatModel = chatModel;
  }

  private async embedBatch(batch: string[]): Promise<number[][]> {
    return throttledRequest("embeddings", async () => {
      const embeddingResponse = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: batch,
      });
      return embeddingResponse.data.map((item) => item.embedding);
    });
  }

  private async embedBatchWithSplit(batch: string[]): Promise<number[][]> {
    try {
      return await this.embedBatch(batch);
    } catch (error) {
      if (batch.length <= 1) {
        throw error;
      }
      const mid = Math.floor(batch.length / 2);
      const left = await this.embedBatchWithSplit(batch.slice(0, mid));
      const right = await this.embedBatchWithSplit(batch.slice(mid));
      return [...left, ...right];
    }
  }

  async embedTexts(texts: string[], options?: EmbedTextsOptions): Promise<number[][]> {
    const batchSize = options?.batchSize || OPENAI_EMBED_BATCH_SIZE;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResult = await this.embedBatchWithSplit(batch);
      embeddings.push(...batchResult);
      console.log(`[embeddings] ${Math.min(i + batch.length, texts.length)}/${texts.length}`);
    }
    return embeddings;
  }

  async getResponse(params: GetResponseParams): Promise<GetResponseResult> {
    const { model, instructions, input, temperature, max_tokens } = params;

    const response = await throttledRequest("responses", async () => {
      return this.openai.responses.create({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: input,
              },
            ],
          },
        ],
        instructions,
        temperature: temperature ?? DEFAULT_TEMPERATURE,
        max_output_tokens: max_tokens ?? DEFAULT_RESPONSE_MAX_TOKENS,
      });
    });

    let text = "";
    const anyResponse = response as any;
    if (anyResponse.output_text) {
      text = anyResponse.output_text;
    } else if (Array.isArray(anyResponse.output)) {
      const outputs = anyResponse.output as Array<{ content?: Array<{ type?: string; text?: string }> }>;
      const parts: string[] = [];
      for (const item of outputs) {
        if (Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === "output_text" && typeof c.text === "string") {
              parts.push(c.text);
            }
          }
        }
      }
      text = parts.join("\n");
    }

    return {
      text,
      raw: response,
      usage: anyResponse.usage,
    };
  }
}
