import { PlanResult } from "../planner/types";
import { displayWorkName } from "../planner/utils/displayWorkName";

interface RenderOptions {
  showTanakhText?: boolean;
  showMishnahText?: boolean;
  limit?: number;
  offset?: number;
}

function clip(text: string, max = 80): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function renderQuoteResultsPretty(result: PlanResult, opts: RenderOptions = {}): string {
  if (result.kind !== "OK") return result.kind === "REFUSAL" ? result.message : "";
  const totals = result.totals || { scanned: 0, withCandidates: 0, confirmed: 0, unconfirmed: 0 };
  const header = `נמצאו ${totals.withCandidates} מקורות עם סימני ציטוט תנ\"ך. שויכו בוודאות ${totals.confirmed}. ללא שיוך ודאי ${totals.unconfirmed}.`;
  const rows = result.rows || [];

  const confirmed: Array<{ ref: string; text: string; candidate: any }> = [];
  const unconfirmed: Array<{ ref: string; text: string; candidate: any }> = [];

  for (const row of rows) {
    if (!row.quoteCandidates) continue;
    for (const qc of row.quoteCandidates) {
      const base = { ref: row.ref, text: row.text, candidate: qc };
      if (qc.status === "CONFIRMED" && qc.matches?.length) confirmed.push(base);
      else unconfirmed.push(base);
    }
  }

  const renderConfirmed = confirmed
    .map((item) => {
      const c = item.candidate;
      const match = (c.matches && c.matches[0]) || null;
      const intro = `${item.ref} — ${c.candidate.signal || "ציטוט"}: ${clip(c.candidate.quoteTextRaw, 120)}`;
      const lines = [intro];
      if (match) {
        lines.push(`שויך ל: ${displayWorkName(match.tanakhRef.split(" ")[0] || "")} ${match.tanakhRef.split(" ").slice(1).join(" ")} (ציון ${match.score.toFixed(2)})`);
        if (opts.showTanakhText && match.tanakhText) {
          lines.push(`פסוק: ${clip(match.tanakhText, 90)}`);
        }
      }
      if (opts.showMishnahText) {
        lines.push(`טקסט מלא: ${clip(item.text, 120)}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const renderUnconfirmedIntro =
    unconfirmed.length > 0 ? "לא נמצא פסוק תואם בוודאות לפי הכללים השמרניים. אפשר להרחיב כללים/לחפש ידנית." : "";

  const renderUnconfirmed = unconfirmed
    .map((item) => `${item.ref} — ${item.candidate.candidate.signal || "ציטוט"}: ${clip(item.candidate.candidate.quoteTextRaw, 120)}`)
    .join("\n");

  const partial =
    totals.limited || (opts.limit !== undefined && totals.scanned > (opts.limit + (opts.offset || 0)))
      ? `הצגה חלקית: מוצגים ${opts.limit || 0} מתוך ${totals.scanned}. השתמש ב --limit או --offset.`
      : "";

  const sections = [
    header,
    confirmed.length ? "✅ ציטוטים עם שיוך ודאי" : "",
    renderConfirmed,
    unconfirmed.length ? "⚠️ ציטוטים ללא שיוך ודאי" : "",
    renderUnconfirmedIntro,
    renderUnconfirmed,
    partial,
  ]
    .filter(Boolean)
    .join("\n");

  return sections.trim();
}
