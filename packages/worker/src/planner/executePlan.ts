import { normalizeText } from "@kol-hatorah/core";
import { getSQLiteManager, ScopeFilter } from "../storage/sqlite";
import { MESSAGES } from "../config/messages";
import { QueryIntent, QueryPlan, PlanResult, ScopeNodeType } from "./types";
import { ensureRegistry } from "./scope/registry";
import { getWorkInForNode } from "./scope/resolver";
import { formatRef } from "./utils/formatRef";

function findTypeForWork(work: string | undefined, registry: Map<string, Set<string>>): string | undefined {
  if (!work) return undefined;
  for (const [t, works] of registry.entries()) {
    if (works.has(work)) return t;
  }
  return undefined;
}

function buildScopeFilter(plan: QueryPlan, registry: Map<string, Set<string>>): ScopeFilter {
  const filter: ScopeFilter = {};
  if (plan.scope.work) {
    filter.work = plan.scope.work;
    filter.type = findTypeForWork(plan.scope.work, registry);
  } else if (plan.scope.node?.type === ScopeNodeType.CORPUS) {
    filter.type = plan.scope.node.name as string;
  } else if (plan.scope.node?.type === ScopeNodeType.SUBCORPUS) {
    const workIn = getWorkInForNode(plan.scope.node as any, registry);
    if (workIn) filter.workIn = workIn;
  }
  if (plan.scope.chapter && plan.scope.work) {
    filter.normalizedRefPrefix = `${plan.scope.work} ${plan.scope.chapter}:`;
  }
  return filter;
}

export async function executePlan(
  plan: QueryPlan,
  query: string,
  opts?: { generalQaHandler?: (q: string) => Promise<PlanResult> }
): Promise<PlanResult> {
  if (plan.disambiguation?.required) {
    return { kind: "DISAMBIGUATION_REQUIRED", message: plan.disambiguation.reason, suggestions: plan.disambiguation.suggestions };
  }

  const registry = await ensureRegistry();
  const sqlite = await getSQLiteManager();

  try {
    switch (plan.intent) {
      case QueryIntent.EXACT_REF: {
        const prefix = plan.ref?.normalizedRef || plan.scope.work || query;
        const scope = buildScopeFilter(plan, registry);
        if (!scope.work && plan.ref?.work) scope.work = plan.ref.work;
        const rows = sqlite.getByPrefix(prefix, scope, plan.limits.maxResults);
        if (!rows.length) {
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        const mapped = rows.map((r) => ({ ref: formatRef(r.work, r.ref), text: r.textPlain }));
        return { kind: "OK", answer: `נמצאו ${mapped.length} תוצאות`, rows: mapped, citations: rows.map((r) => r.ref), plan };
      }
      case QueryIntent.WORD_OCCURRENCES:
      case QueryIntent.QUOTE_ENTITY: {
        const termNorm = normalizeText(plan.term || "").textNorm;
        const scope = buildScopeFilter(plan, registry);
        const rows = sqlite.findTerm(termNorm, scope, plan.limits.maxResults);
        const count = sqlite.countTerm(termNorm, scope);
        if (!rows.length) {
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        const mapped = rows.map((r) => ({ ref: formatRef(r.work, r.ref), text: r.textPlain }));
        return { kind: "OK", answer: `נמצאו ${count} מופעים`, rows: mapped, citations: rows.map((r) => r.ref), plan };
      }
      case QueryIntent.LIST_WORKS_MENTIONING_ENTITY: {
        const termNorm = normalizeText(plan.term || "").textNorm;
        const scope: ScopeFilter = { type: "mishnah" };
        const works = sqlite.findTermByWork(termNorm, scope, plan.limits.maxResults);
        if (!works.length) {
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        return { kind: "OK", answer: "מסכתות שנמצאו:", works: works.map((w) => ({ work: w.work, count: w.count })), plan };
      }
      case QueryIntent.CHAPTER_ABOUT: {
        const prefix = plan.scope.work && plan.scope.chapter ? `${plan.scope.work} ${plan.scope.chapter}:` : "";
        const scope = buildScopeFilter(plan, registry);
        const rows = prefix ? sqlite.getByPrefix(prefix, scope, plan.limits.maxResults) : [];
        if (!rows.length) {
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        const mapped = rows.map((r) => ({ ref: formatRef(r.work, r.ref), text: r.textPlain }));
        return { kind: "OK", answer: `תוצאות לפרק ${plan.scope.chapter}`, rows: mapped, citations: rows.map((r) => r.ref), plan };
      }
      case QueryIntent.GENERAL_QA: {
        if (opts?.generalQaHandler) {
          return opts.generalQaHandler(query);
        }
        return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
      }
      default:
        return { kind: "REFUSAL", message: "שגיאת תכנון שאילתה" };
    }
  } finally {
    sqlite.close();
  }
}
