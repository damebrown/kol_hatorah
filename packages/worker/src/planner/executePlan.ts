import { normalizeText } from "@kol-hatorah/core";
import { getSQLiteManager, ScopeFilter } from "../storage/sqlite";
import { MESSAGES } from "../config/messages";
import { QueryIntent, QueryPlan, PlanResult, ScopeNodeType } from "./types";
import { ensureRegistry } from "./scope/registry";
import { getWorkInForNode } from "./scope/resolver";
import { formatRef } from "./utils/formatRef";
import { formatMishnahRefHeb } from "./utils/formatMishnahRefHeb";
import { detectQuotesWithLinks } from "../quotes/detectQuotes";
import { QUOTE_MESSAGES } from "../quotes/messages";
import { runRefLinking } from "../reflink/runRefLinking";
import { runMishnahParenRefs, buildMishnahParenRefsPlanResult } from "../reflink/runMishnahParenRefs";

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
    filter.type = findTypeForWork(plan.scope.work, registry);
    const work = plan.scope.work;
    if (filter.type === "mishnah") {
      filter.workIn = [work];
      if (work.startsWith("Mishnah ")) {
        filter.workIn.push(work.slice(8));
      } else {
        filter.workIn.push(`Mishnah ${work}`);
      }
      delete (filter as any).work;
    } else {
      filter.work = work;
    }
  } else if (plan.scope.node?.type === ScopeNodeType.CORPUS) {
    filter.type = plan.scope.node.name as string;
  } else if (plan.scope.node?.type === ScopeNodeType.SUBCORPUS) {
    const workIn = getWorkInForNode(plan.scope.node as any, registry);
    if (workIn) {
      filter.type = "tanakh"; // subcorpus applies only to tanakh divisions
      filter.workIn = workIn;
    }
  }
  if (plan.scope.chapter && plan.scope.work) {
    filter.normalizedRefPrefix = `${plan.scope.work} ${plan.scope.chapter}:`;
  }
  return filter;
}

async function runReferenceLinking(
  plan: QueryPlan,
  registry: Map<string, Set<string>>,
  sqlite: any,
  pagination?: { limit?: number; offset?: number }
): Promise<PlanResult> {
  const scope = buildScopeFilter(plan, registry);
  const limit = pagination?.limit ?? plan.limits.maxResults;
  const offset = pagination?.offset ?? 0;
  const total = sqlite.countSegments(scope);
  const segments = sqlite.getSegments(scope, limit, offset);
  let withCandidates = 0;
  let confirmed = 0;
  let unconfirmed = 0;
  const rows: any[] = [];
  for (const seg of segments) {
    const results = await runRefLinking(
      seg.textPlain,
      { id: seg.id, type: seg.type, work: seg.work, ref: seg.ref },
      { sqlite, targetTypes: plan.targetTypes }
    );
    if (!results.length) continue;
    withCandidates += 1;
    results.forEach((r: any) => {
      if (r.status === "CONFIRMED") confirmed += 1;
      else unconfirmed += 1;
    });
    rows.push({ ref: formatRef(seg.work, seg.ref), text: seg.textPlain, refLinks: results });
  }
  const filtered = rows;
  if (!filtered.length) {
    return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
  }
  return {
    kind: "OK",
    answer: "נמצאו מקורות עם הפניות",
    rows: filtered,
    totals: { scanned: total, withCandidates, confirmed, unconfirmed, limited: total > limit + offset },
    plan,
  };
}

export async function executePlan(
  plan: QueryPlan,
  query: string,
  opts?: {
    generalQaHandler?: (q: string) => Promise<PlanResult>;
    pagination?: { limit?: number; offset?: number };
    sqlite?: any;
    debug?: boolean;
    debugReflink?: boolean;
    quoteDetector?: typeof detectQuotesWithLinks;
  }
): Promise<PlanResult> {
  if (plan.disambiguation?.required) {
    return { kind: "DISAMBIGUATION_REQUIRED", message: plan.disambiguation.reason, suggestions: plan.disambiguation.suggestions };
  }

  const registry = await ensureRegistry();
  const sqlite = opts?.sqlite || (await getSQLiteManager());

  switch (plan.intent) {
      case QueryIntent.EXACT_REF: {
        const refStr = plan.ref?.normalizedRef || plan.scope.work || query;
        const scope = buildScopeFilter(plan, registry);
        if (!scope.work && plan.ref?.work) scope.work = plan.ref.work;
        const direct = plan.ref?.normalizedRef ? sqlite.getRef(plan.ref.normalizedRef) : null;
        const rows = direct ? [direct] : sqlite.getByPrefix(refStr, scope, plan.limits.maxResults);
        if (!rows.length) {
          return { kind: "REFUSAL", message: "לא נמצא" };
        }
        const mapped = rows.map((r: any) => {
          const isMishnah = r.type === "mishnah" || (r.work || "").startsWith("Mishnah");
          const chapterNum = plan.ref?.chapter ?? Number((r.ref || "0").split(":")[0]);
          const mishnahNum = plan.ref?.verse ?? Number((r.ref || "0").split(":")[1]);
          const refHeb = isMishnah ? formatMishnahRefHeb(r.work, chapterNum, mishnahNum) : formatRef(r.work, r.ref);
          return { ref: r.ref, refHeb, text: r.textPlain };
        });
        return {
          kind: "OK",
          answer: `נמצאו ${mapped.length} תוצאות`,
          rows: mapped,
          citations: rows.map((r: any) => r.ref),
          plan,
        };
      }
      case QueryIntent.WORD_OCCURRENCES:
      case QueryIntent.QUOTE_ENTITY: {
        const termNorm = normalizeText(plan.term || "").textNorm;
        const scope = buildScopeFilter(plan, registry);
        const limit = opts?.pagination?.limit ?? plan.limits.maxResults;
        const offset = opts?.pagination?.offset ?? 0;
        const rows = sqlite.findTerm(termNorm, scope, limit, offset);
        const typeSet = new Set(rows.map((r: any) => r.type));
        if (scope.type && typeSet.size > 0 && (typeSet.has("mishnah") || typeSet.has("bavli")) && scope.type === "tanakh") {
          if (opts?.pagination && "debug" in opts) {
            // no-op, legacy; we'll just refuse
          }
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        const count = sqlite.countTerm(termNorm, scope);
        if (!rows.length) {
          return { kind: "REFUSAL", message: "לא נמצא" };
        }
        const mapped = rows.map((r: any) => ({ ref: formatRef(r.work, r.ref), text: r.textPlain }));
        return {
          kind: "OK",
          answer: `נמצאו ${count} מופעים`,
          rows: mapped,
          citations: rows.map((r: any) => r.ref),
          totals: { scanned: count, withCandidates: rows.length, confirmed: 0, unconfirmed: 0, limited: count > limit + offset },
          plan,
        };
      }
      case QueryIntent.LIST_WORKS_MENTIONING_ENTITY: {
        const termNorm = normalizeText(plan.term || "").textNorm;
        const scope: ScopeFilter = { type: "mishnah" };
        const works = sqlite.findTermByWork(termNorm, scope, plan.limits.maxResults);
        if (!works.length) {
          return { kind: "REFUSAL", message: "לא נמצא" };
        }
        return { kind: "OK", answer: "מסכתות שנמצאו:", works: works.map((w: any) => ({ work: w.work, count: w.count })), plan };
      }
      case QueryIntent.CHAPTER_ABOUT: {
        const prefix = plan.scope.work && plan.scope.chapter ? `${plan.scope.work} ${plan.scope.chapter}:` : "";
        const scope = buildScopeFilter(plan, registry);
        const rows = prefix ? sqlite.getByPrefix(prefix, scope, plan.limits.maxResults) : [];
        if (!rows.length) {
          return { kind: "REFUSAL", message: "לא נמצא" };
        }
        const mapped = rows.map((r: any) => ({ ref: formatRef(r.work, r.ref), text: r.textPlain }));
        return { kind: "OK", answer: `תוצאות לפרק ${plan.scope.chapter}`, rows: mapped, citations: rows.map((r: any) => r.ref), plan };
      }
      case QueryIntent.GENERAL_QA: {
        if (opts?.generalQaHandler) {
          return opts.generalQaHandler(query);
        }
        return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
      }
      case QueryIntent.QUOTE_QUERY: {
        const scope = buildScopeFilter(plan, registry);
        if (scope.type === "mishnah" && (scope.work || (scope.workIn && scope.workIn.length > 0))) {
          const { matches, scanned, debugStats, limited } = await runMishnahParenRefs(sqlite, scope, {
            debug: opts?.debug,
            debugReflink: opts?.debugReflink,
            /* No pagination = full tractate scan */
          });
          if (opts?.debug && debugStats) {
            // eslint-disable-next-line no-console
            console.error(
              `[MishnahParenRefs] scanned=${debugStats.totalSegmentsScanned} candidates=${debugStats.totalCandidatesFound} links=${debugStats.totalLinksConfirmed}`,
              debugStats.rawParensSample.length ? `sample=${JSON.stringify(debugStats.rawParensSample)}` : ""
            );
          }
          return buildMishnahParenRefsPlanResult(matches, scanned, plan, limited);
        }
        const updatedPlan = { ...plan, targetTypes: ["tanakh"] };
        return runReferenceLinking(updatedPlan, registry, sqlite, opts?.pagination);
      }
      case QueryIntent.FIND_REFERENCES: {
        const scope = buildScopeFilter(plan, registry);
        const wantsTanakh = !plan.targetTypes?.length || plan.targetTypes.includes("tanakh");
        if (scope.type === "mishnah" && (scope.work || (scope.workIn && scope.workIn.length > 0)) && wantsTanakh) {
          const { matches, scanned, debugStats, limited } = await runMishnahParenRefs(sqlite, scope, {
            debug: opts?.debug,
            debugReflink: opts?.debugReflink,
          });
          if (opts?.debug && debugStats) {
            // eslint-disable-next-line no-console
            console.error(
              `[MishnahParenRefs] scanned=${debugStats.totalSegmentsScanned} candidates=${debugStats.totalCandidatesFound} links=${debugStats.totalLinksConfirmed}`,
              debugStats.rawParensSample.length ? ` sample=${JSON.stringify(debugStats.rawParensSample)}` : ""
            );
          }
          return buildMishnahParenRefsPlanResult(matches, scanned, plan, limited);
        }
        return runReferenceLinking(plan, registry, sqlite, opts?.pagination);
      }
      case QueryIntent.CORPUS_QUOTE_QUERY: {
        const scope = buildScopeFilter(plan, registry);
        if (!scope.type) {
          if (plan.scope.work) scope.type = "mishnah";
        }
        if (scope.type === "mishnah" && (scope.work || (scope.workIn && scope.workIn.length > 0))) {
          const { matches, scanned, debugStats, limited } = await runMishnahParenRefs(sqlite, scope, {
            debug: opts?.debug,
            debugReflink: opts?.debugReflink,
          });
          if (opts?.debug && debugStats) {
            // eslint-disable-next-line no-console
            console.error(
              `[MishnahParenRefs] scanned=${debugStats.totalSegmentsScanned} candidates=${debugStats.totalCandidatesFound} links=${debugStats.totalLinksConfirmed}`,
              debugStats.rawParensSample.length ? `sample=${JSON.stringify(debugStats.rawParensSample)}` : ""
            );
          }
          return buildMishnahParenRefsPlanResult(matches, scanned, plan, limited);
        }
        const limit = opts?.pagination?.limit ?? plan.limits.maxResults;
        const offset = opts?.pagination?.offset ?? 0;
        const total = sqlite.countSegments(scope);
        const segments = sqlite.getSegments(scope, limit, offset);
        let withCandidates = 0;
        let confirmed = 0;
        let unconfirmed = 0;
        const rows = segments
          .map((seg: any) => {
            const det = detectQuotesWithLinks(seg.textPlain, { type: seg.type, sqlite });
            if (!det.length) return null;
            withCandidates += 1;
            det.forEach((d: any) => {
              if (d.status === "CONFIRMED") confirmed += 1;
              else unconfirmed += 1;
            });
            return {
              ref: formatRef(seg.work, seg.ref),
              text: seg.textPlain,
              quoteCandidates: det,
            };
          })
          .filter(Boolean) as any[];
        if (!rows.length) {
          return { kind: "REFUSAL", message: MESSAGES.REFUSAL_INSUFFICIENT };
        }
        return {
          kind: "OK",
          answer: "מקורות שמכילים ציטוטים מהתנ\"ך",
          rows,
          totals: { scanned: total, withCandidates, confirmed, unconfirmed, limited: total > limit + offset },
          plan,
        };
      }
      default:
        return { kind: "REFUSAL", message: "שגיאת תכנון שאילתה" };
  }
}
