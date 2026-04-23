import { QueryIntent, QueryPlan, PlanResult } from "../planner/types";
import { TurnSummary } from "./types";

/** Maximum characters kept in the answer snippet stored per turn. */
const SNIPPET_MAX_CHARS = 120;

/**
 * Builds a compact TurnSummary from a completed plan and its rendered result.
 *
 * @param userQuery     The original query the user typed.
 * @param plan          The QueryPlan produced by the planner.
 * @param execResult    The PlanResult returned by executePlan.
 * @param text          The final rendered text shown to the user.
 * @param standaloneQuery  The rewritten/reconstructed query sent to the planner,
 *                         if it differed from userQuery (undefined otherwise).
 */
export function extractTurnSummary(userQuery: string, plan: QueryPlan, execResult: PlanResult, text: string, standaloneQuery?: string): TurnSummary {
  return {
    userQuery,
    rewrittenQuery: standaloneQuery !== undefined && standaloneQuery !== userQuery ? standaloneQuery : undefined,
    intent: plan.intent,
    lastRefs: extractLastRefs(plan),
    answerSnippet: text.slice(0, SNIPPET_MAX_CHARS),
    disambiguationPending: extractDisambiguationPending(plan, execResult, standaloneQuery ?? userQuery),
  };
}

/** Extracts resolved references from the plan for use as rewriter context. */
function extractLastRefs(plan: QueryPlan): TurnSummary["lastRefs"] {
  if (plan.ref?.normalizedRef) {
    return [{ work: plan.ref.work ?? "", normalizedRef: plan.ref.normalizedRef }];
  }
  if (
    (plan.intent === QueryIntent.CHAPTER_ABOUT || plan.intent === QueryIntent.EXACT_REF) &&
    plan.scope.work &&
    plan.scope.chapter != null
  ) {
    return [{ work: plan.scope.work, normalizedRef: `${plan.scope.work} ${plan.scope.chapter}:` }];
  }
  return [];
}

/**
 * Returns disambiguationPending when the plan required disambiguation,
 * or undefined for normal results.
 */
function extractDisambiguationPending(plan: QueryPlan, execResult: PlanResult, originalQuery: string): TurnSummary["disambiguationPending"] {
  if (plan.disambiguation?.required !== true) return undefined;
  if (execResult.kind !== "DISAMBIGUATION_REQUIRED") return undefined;
  return {
    question: plan.disambiguation.reason,
    suggestions: plan.disambiguation.suggestions,
    originalQuery,
  };
}
