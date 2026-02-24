import { PlanResult } from "./types";

export function renderResult(result: PlanResult): string {
  if (result.kind === "DISAMBIGUATION_REQUIRED") {
    return `${result.message}\nהצעות:\n- ${result.suggestions.join("\n- ")}`;
  }
  if (result.kind === "REFUSAL") {
    return result.message;
  }
  if (result.works && result.works.length) {
    const list = result.works.map((w: { work: string; count?: number }) => `${w.work}${w.count ? ` (${w.count})` : ""}`).join("\n");
    return [result.answer, list].filter(Boolean).join("\n");
  }
  const rowsPart = result.rows
    ? result.rows
        .map((r: { ref: string; refHeb?: string; text: string; quoteCandidates?: any[] }) => {
          const refDisplay = r.refHeb || r.ref;
          if (result.plan?.intent === "EXACT_REF") {
            return `${refDisplay}: ${r.text}`;
          }
          const base = `${refDisplay}: ${r.text.substring(0, 120)}${r.text.length > 120 ? "..." : ""}`;
          if (r.quoteCandidates && r.quoteCandidates.length) {
            const q = r.quoteCandidates
              .map((qc: any) => `${qc.status}: ${qc.candidate.quoteTextRaw.substring(0, 80)}`)
              .join(" | ");
            return `${base} [${q}]`;
          }
          return base;
        })
        .join("\n")
    : "";
  const totalsPart = result.totals
    ? `נסרקו ${result.totals.scanned}, עם מועמדים ${result.totals.withCandidates}, מאושרים ${result.totals.confirmed}, לא מאושרים ${result.totals.unconfirmed}${
        result.totals.limited ? " (תוצאה חלקית)" : ""
      }`
    : "";
  return [result.answer, rowsPart, totalsPart].filter(Boolean).join("\n");
}
