/**
 * Query resolver for multi-turn conversations.
 * Handles two cases:
 *   1. Disambiguation bypass: if the last turn has a pending disambiguation,
 *      reconstructs the query deterministically without an LLM call.
 *   2. LLM rewriting: rewrites a follow-up query into a standalone query using
 *      prior turn context. Fail-open — returns original query on any LLM failure.
 */
import { getConfig, OpenAIService } from "@kol-hatorah/core";
import { TurnSummary } from "./types";

const REWRITER_SYSTEM_PROMPT = `You are a query rewriter for a Hebrew Jewish texts search system (Tanakh, Mishnah, Talmud).
Given a follow-up query and prior conversation turns, rewrite the query into a complete, self-contained Hebrew query that a search system can execute without any knowledge of the prior context.

Rules:
- If the query is already fully self-contained, return it exactly as-is.
- If it references prior context (pronouns like "זה", "שם", ellipsis like "ועוד", "תרחיב"), resolve the reference using the prior turns.
- Use only information from the provided turns. Never invent content.
- Return the rewritten query only. No explanation, no prefix, no markdown.`;

async function callLLMInternal(userPrompt: string): Promise<string> {
  const config = getConfig();
  const service = new OpenAIService(
    config.openai.apiKey,
    config.openai.embeddingModel,
    config.openai.chatModel
  );
  const result = await service.getResponse({
    model: config.openai.chatModel,
    instructions: REWRITER_SYSTEM_PROMPT,
    input: userPrompt,
    temperature: 0,
    max_tokens: 150,
  });
  return result.text;
}

/** Formats prior turns into a compact Hebrew context block for the rewriter prompt. */
function formatContext(query: string, priorTurns: TurnSummary[]): string {
  const turnsBlock = priorTurns
    .map((t, i) => {
      const refs = t.lastRefs.length > 0 ? t.lastRefs.map((r) => r.normalizedRef).join(", ") : "—";
      return `פנייה ${i + 1}: שאלה: "${t.userQuery}" | כוונה: ${t.intent} | מיקומים: ${refs} | תשובה: "${t.answerSnippet}"`;
    })
    .join("\n");
  return `שיחה קודמת:\n${turnsBlock}\n\nשאלה נוכחית: "${query}"\n\nשאלה עצמאית:`;
}

export type RewriterOptions = {
  /** Override for testing — inject a mock LLM call. */
  callLLM?: (prompt: string) => Promise<string>;
};

/**
 * Resolves a follow-up query into a standalone query.
 *
 * - Returns the original query immediately when there are no prior turns.
 * - Bypasses the LLM and reconstructs deterministically when the last turn
 *   has a pending disambiguation.
 * - Otherwise calls the LLM rewriter; fails open to the original query on error.
 */
export async function resolveQuery(query: string, priorTurns: TurnSummary[], opts?: RewriterOptions): Promise<string> {
  if (priorTurns.length === 0) return query;

  const lastTurn = priorTurns[priorTurns.length - 1];
  if (lastTurn.disambiguationPending) {
    return `${lastTurn.disambiguationPending.originalQuery} ב${query.trim()}`;
  }

  const callLLM = opts?.callLLM ?? callLLMInternal;
  try {
    const prompt = formatContext(query, priorTurns);
    const rewritten = (await callLLM(prompt)).trim();
    return rewritten.length > 0 ? rewritten : query;
  } catch {
    return query;
  }
}
