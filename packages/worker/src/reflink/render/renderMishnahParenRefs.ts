import type { MishnahParenRefMatch } from "../runMishnahParenRefs";
import { MISHNAH_PAREN_REFS } from "../../config/mishnahParenRefs";
import { sanitizeDisplayText } from "../../planner/utils/sanitizeDisplayText";

interface RenderOpts {
  groupBy?: "TANAKH" | "MISHNAH";
  showTanakhText?: boolean;
  limit?: number;
  debugReflink?: boolean;
  /** When true, print row.ref → parsed → formatted for each hit (confirms ref mapping). */
  debug?: boolean;
}

/**
 * Pretty render for Mishnah parenthetical Tanakh ref results.
 * No English refs, Hebrew numerals only. Shows verse text when available.
 */
export function renderMishnahParenRefsPretty(
  matches: MishnahParenRefMatch[],
  opts: RenderOpts = {}
): string {
  if (!matches.length) return "לא נמצאו ציטוטים מפורשים (בסוגריים) מהתנ\"ך.";

  const limit = opts.limit ?? MISHNAH_PAREN_REFS.DISPLAY_LIMIT;
  const showAll = matches.length <= limit;
  const toRender = showAll ? matches : matches.slice(0, limit);
  const header = !showAll ? `נמצאו ${matches.length} הפניות. הנה ${limit} מהן:\n` : "";

  const groupBy = opts.groupBy ?? "MISHNAH";
  const showVerseText = opts.showTanakhText !== false;

  if (groupBy === "TANAKH") {
    return header + renderGroupByTanakh(toRender, { ...opts, showTanakhText: showVerseText });
  }
  return header + renderGroupByMishnah(toRender, { ...opts, showTanakhText: showVerseText });
}

function renderGroupByMishnah(matches: MishnahParenRefMatch[], opts: RenderOpts): string {
  const lines: string[] = [];
  const showMarker = opts.debugReflink ?? false;
  for (const m of matches) {
    const tanakhList = m.tanakhRefsHeb.join(", ");
    const statusSuffix = m.verseStatus ? ` (${m.verseStatus})` : "";
    const markerPart = showMarker ? ` (${m.markerText}) → ` : " — ";
    const main = `${m.mishnahRefHeb}${markerPart}${tanakhList}${statusSuffix}`;
    lines.push(main);
    if (opts.showTanakhText && m.tanakhLinks[0]?.text) {
      lines.push(`  ${sanitizeDisplayText(m.tanakhLinks[0].text)}`);
    }
    if (opts.debugReflink && m.reflinkDebug) {
      lines.push(m.reflinkDebug);
    }
    if (opts.debug && (m as any)._debugRef) {
      const d = (m as any)._debugRef;
      lines.push(`    [debug] row.ref=${d.rowRef} → parsed(ch=${d.parsed?.ch},mish=${d.parsed?.mish}) → ${d.formatted}`);
    }
  }
  return lines.join("\n");
}

function renderGroupByTanakh(matches: MishnahParenRefMatch[], opts: RenderOpts): string {
  const byTanakh = new Map<string, MishnahParenRefMatch[]>();
  for (const m of matches) {
    for (const refHeb of m.tanakhRefsHeb) {
      const list = byTanakh.get(refHeb) ?? [];
      list.push(m);
      byTanakh.set(refHeb, list);
    }
  }
  const lines: string[] = [];
  for (const [tanakhRef, list] of Array.from(byTanakh.entries()).sort()) {
    const mishnahRefs = [...new Set(list.map((x) => x.mishnahRefHeb))];
    lines.push(`${tanakhRef}`);
    lines.push(`  — ${mishnahRefs.join(", ")}`);
    if (opts.showTanakhText && list[0]?.tanakhLinks[0]?.text) {
      lines.push(`  ${sanitizeDisplayText(list[0].tanakhLinks[0].text)}`);
    }
    if (opts.debugReflink && list[0]?.reflinkDebug) {
      lines.push(list[0].reflinkDebug);
    }
  }
  return lines.join("\n");
}
