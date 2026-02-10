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
        .map((r: { ref: string; text: string }) => `${r.ref}: ${r.text.substring(0, 120)}${r.text.length > 120 ? "..." : ""}`)
        .join("\n")
    : "";
  const citations = result.formattedCitations || (result.citations ? result.citations.join(", ") : "");
  return [result.answer, rowsPart, citations ? `ציטוטים: ${citations}` : ""].filter(Boolean).join("\n");
}
