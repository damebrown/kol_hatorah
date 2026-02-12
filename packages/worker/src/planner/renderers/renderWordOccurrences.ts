import { PlanResult, ScopeNodeType } from "../types";
import { formatHebrewRef } from "../utils/hebrewNumerals";

const MAX_CHARS = 160;

function clipText(text: string, max: number = MAX_CHARS): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}… (מקוצר)`;
}

function sanitizeDisplayText(text: string): string {
  let t = text;
  t = t.replace(/&nbsp;/g, " ");
  t = t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); // basic entities
  t = t.replace(/&[a-zA-Z0-9#]+;/g, " "); // strip other entities conservatively
  t = t.replace(/<[^>]*>/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function isOk(result: PlanResult): result is Extract<PlanResult, { kind: "OK" }> {
  return result.kind === "OK";
}

function scopeText(planScope: any): string {
  const scope = planScope;
  if (scope.work) return `ב${scope.work}`;
  if (scope.node?.type === ScopeNodeType.SUBCORPUS) return `ב${scope.node.name}`;
  if (scope.node?.type === ScopeNodeType.CORPUS) return `ב${scope.node.name}`;
  return "בקורפוס";
}

export function renderWordOccurrencesPretty(
  result: PlanResult,
  opts: { term?: string; limit?: number; offset?: number }
): string {
  if (!isOk(result)) return (result as any).message || "";
  const ok = result;
  const totals = ok.totals || { scanned: ok.rows?.length || 0 };
  const limit = opts.limit ?? result.rows?.length ?? 0;
  const offset = opts.offset ?? 0;
  const term = opts.term || ok.plan.term || "";
  const scope = scopeText(ok.plan.scope);
  const baseCount = totals.scanned || 0;
  const showingPhrase =
    baseCount > limit ? ` הנה ${limit}${offset > 0 ? ` החל מ-${offset + 1}` : ""} מהם:` : "";
  const headline =
    baseCount > 0
      ? `נמצאו ${baseCount} מקורות ${scope} שבהם מופיעה המילה ‘${term}’.${showingPhrase}`
      : `לא נמצאו מקורות ${scope} עבור המילה ‘${term}’.`;

  const body = (ok.rows || [])
    .map((r) => {
      const ref = formatHebrewRef(r.ref);
      const text = clipText(sanitizeDisplayText(r.text));
      return `${ref} — ${text}`;
    })
    .join("\n");

  return [headline, body].filter(Boolean).join("\n");
}
