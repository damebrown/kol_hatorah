import { formatHebrewRef } from "../../planner/utils/hebrewNumerals";
import { RefLinkResult } from "../types/RefLinkResult";

interface RenderOpts {
  showSourceText?: boolean;
  showTargetText?: boolean;
}

export function renderRefLinksPretty(results: RefLinkResult[], opts: RenderOpts = {}): string {
  if (!results.length) return "לא נמצאו הפניות מזוהות.";
  const lines: string[] = [];
  for (const res of results) {
    const c = res.candidate;
    const header = c.sourceRef ? `${c.sourceRef}` : c.sourceWork || "קטע";
    lines.push(`מקור: ${header}`);
    if (opts.showSourceText && c.rawText) {
      lines.push(`״${c.rawText}״`);
    }
    if (!res.links.length) {
      lines.push("→ לא נמצא יעד תואם\n");
      continue;
    }
    res.links.forEach((link, idx) => {
      const ref = formatHebrewRef(link.targetRef, { singleWithoutGeresh: true });
      lines.push(`→ ${idx + 1}. ${ref} (ציון ${link.score.toFixed(2)})`);
      if (opts.showTargetText && link.targetText) {
        lines.push(link.targetText);
      }
    });
    lines.push("");
  }
  return lines.join("\n").trim();
}
