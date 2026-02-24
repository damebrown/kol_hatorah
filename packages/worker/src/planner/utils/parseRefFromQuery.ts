import { WorkRegistry } from "../types";
import { resolveScopeNode } from "../scope/resolver";
import { parseHebrewNumeral } from "./parseHebrewNumeral";

type ParsedRef =
  | {
      work: string;
      chapter: number;
      verse: number;
      normalizedRef: string;
      rawWork: string;
    }
  | null;

function parseNumber(token: string | undefined): number | null {
  if (!token) return null;
  const t = token.replace(/[\"״׳'‎]/g, "").trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const heb = parseHebrewNumeral(t);
  return heb ?? null;
}

function resolveWork(raw: string, registry: WorkRegistry): string | undefined {
  const res = resolveScopeNode(raw, registry);
  return res.workName || raw;
}

export function parseRefFromQuery(query: string, registry: WorkRegistry): ParsedRef {
  const q = query.trim();

  // Direct <work> <chap>:<verse> (digits or Hebrew numerals)
  const direct = q.match(/^(.+?)\s+([0-9א-ת\"״׳'‎]+)\s*:\s*([0-9א-ת\"״׳'‎]+)/);
  if (direct) {
    const workRaw = direct[1].trim();
    const ch = parseNumber(direct[2]);
    const vs = parseNumber(direct[3]);
    const work = resolveWork(workRaw, registry);
    if (work && ch && vs) {
      return { work, chapter: ch, verse: vs, normalizedRef: `${work} ${ch}:${vs}`, rawWork: workRaw };
    }
  }

  // Phrasing: "משנה X בפרק Y במסכת Z"
  const phrasingPatterns: Array<{ re: RegExp; order: { mishnah: number; chapter: number; work: number } }> = [
    { re: /משנה\s+([^\s]+)\s+בפרק\s+([^\s]+)\s+במסכת\s+([^\s]+)/, order: { mishnah: 1, chapter: 2, work: 3 } },
    { re: /מהי\s+משנה\s+([^\s]+)\s+בפרק\s+([^\s]+)\s+במסכת\s+([^\s]+)/, order: { mishnah: 1, chapter: 2, work: 3 } },
    { re: /משנה\s+([^\s]+)\s+בפרק\s+([^\s]+)\s+ב([^\s]+)/, order: { mishnah: 1, chapter: 2, work: 3 } },
    { re: /משנה\s+([^\s]+)\s+במסכת\s+([^\s]+)\s*([^\s]+)/, order: { mishnah: 1, chapter: 3, work: 2 } }, // "משנה ז בסוטה א׳"
    { re: /משנה\s+([^\s]+)\s+ב([^\s]+)\s+([^\s]+)/, order: { mishnah: 1, chapter: 3, work: 2 } }, // "משנה ז בסוטה א׳" without "מסכת"
  ];
  for (const { re, order } of phrasingPatterns) {
    const m = q.match(re);
    if (!m) continue;
    const mishnahToken = m[order.mishnah];
    const chapterToken = m[order.chapter];
    const workToken = m[order.work];
    const mishnahNum = parseNumber(mishnahToken);
    const chapterNum = parseNumber(chapterToken);
    const work = resolveWork(workToken, registry);
    if (work && mishnahNum && chapterNum) {
      return { work, chapter: chapterNum, verse: mishnahNum, normalizedRef: `${work} ${chapterNum}:${mishnahNum}`, rawWork: workToken };
    }
  }

  return null;
}
