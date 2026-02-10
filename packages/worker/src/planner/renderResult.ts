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
        .map((r: { ref: string; text: string; quoteCandidates?: any[] }) => {
          const base = `${r.ref}: ${r.text.substring(0, 120)}${r.text.length > 120 ? "..." : ""}`;
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
  const citations = result.formattedCitations || (result.citations ? result.citations.join(", ") : "");
  return [result.answer, rowsPart, totalsPart, citations ? `ציטוטים: ${citations}` : ""].filter(Boolean).join("\n");
}
