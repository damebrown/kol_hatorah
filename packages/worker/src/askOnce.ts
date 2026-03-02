/**
 * Reusable "ask" flow: planQuery -> executePlan -> render (final text).
 * Used by both CLI and web API.
 */
import { getConfig } from "@kol-hatorah/core";
import { planQueryWithLLMRouter, executePlan, renderResult, QueryIntent, ensureRegistry } from "./queryPlanner";
import { normalizeQueryInput } from "./cli/utils/normalizeQuery";
import { MISHNAH_PAREN_REFS } from "./config/mishnahParenRefs";

export interface AskOnceParams {
  q: string;
  debug?: boolean;
}

export interface AskOnceResponse {
  text: string;
  debug?: unknown;
}

export async function askOnce(params: AskOnceParams): Promise<AskOnceResponse> {
  const { q, debug } = params;
  const normalizedQuery = normalizeQueryInput(q || "");

  if (!normalizedQuery) {
    return { text: "נא להזין שאילתה." };
  }

  const config = getConfig();
  const limit = config.rag.topK;

  const registry = await ensureRegistry();
  const plan = await planQueryWithLLMRouter(normalizedQuery, registry);

  const paginationLimit =
    plan.intent === QueryIntent.WORD_OCCURRENCES || plan.intent === QueryIntent.CORPUS_QUOTE_QUERY
      ? plan.limits.maxResults
      : limit;

  const execResult = await executePlan(plan, normalizedQuery, {
    pagination: { limit: paginationLimit, offset: 0 },
    debug,
    debugReflink: debug,
    generalQaHandler: async (query: string) => {
      const { askOnce: askRag } = await import("./cli/commands/ask");
      const result = await askRag({
        query,
        limit,
      });
      return {
        kind: "OK" as const,
        answer: result.answer,
        citations: result.citations,
        formattedCitations: result.formattedCitations,
        plan,
      };
    },
  });

  let text: string;

  if (plan.intent === QueryIntent.WORD_OCCURRENCES) {
    const { renderWordOccurrencesPretty } = await import("./planner/renderers/renderWordOccurrences");
    text = renderWordOccurrencesPretty(execResult, {
      term: plan.term,
      limit: paginationLimit,
      offset: 0,
    });
  } else if (
    plan.intent === QueryIntent.QUOTE_QUERY ||
    plan.intent === QueryIntent.FIND_REFERENCES ||
    plan.intent === QueryIntent.CORPUS_QUOTE_QUERY
  ) {
    const rows = (execResult.kind === "OK" ? execResult.rows : []) as any[];
    const isMishnahParenRefs = rows[0]?.mishnahRefHeb != null;
    const isQuoteCandidates = rows[0]?.quoteCandidates != null;
    if (isMishnahParenRefs) {
      const { renderMishnahParenRefsPretty } = await import("./reflink/render/renderMishnahParenRefs");
      const groupBy = normalizedQuery.includes("והמיקום") || normalizedQuery.includes("מיקום") ? "TANAKH" : "MISHNAH";
      text = renderMishnahParenRefsPretty(rows, {
        groupBy,
        showTanakhText: true,
        limit: MISHNAH_PAREN_REFS.DISPLAY_LIMIT,
        debugReflink: debug,
        debug,
      });
    } else if (isQuoteCandidates) {
      const { renderQuoteResultsPretty } = await import("./quotes/renderQuoteResults");
      text = renderQuoteResultsPretty(execResult, {
        showTanakhText: true,
        showMishnahText: false,
        limit: paginationLimit,
        offset: 0,
      });
    } else {
      const { renderRefLinksPretty } = await import("./reflink/render/renderRefLinks");
      const refs = rows.flatMap((r) => r.refLinks || []);
      text = renderRefLinksPretty(refs, { showSourceText: false, showTargetText: true });
    }
  } else {
    text = renderResult(execResult);
  }

  const response: AskOnceResponse = { text };
  if (debug) {
    response.debug = { plan, execResult };
  }
  return response;
}
