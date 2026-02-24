import { TANAKH_HEB_TO_CANONICAL, expandTanakhAlias } from "../planner/scope/mappings/tanakhBooks";
import { parseHebrewNumeral } from "../planner/utils/parseHebrewNumeral";

export interface ParsedTanakhRef {
  workCanon: string;
  chapter: number;
  verse: number | null;
  normalizedRefPrefix: string;
  rawRefString: string;
  isSham?: boolean;
}

const NIQQUD_RE = /[\u0591-\u05C7]/g;
const GERSHAYIM = /["״׳'‎]/g;

function stripNiqqud(s: string): string {
  return s.replace(NIQQUD_RE, "").trim();
}

function normalizeForParse(s: string): string {
  return stripNiqqud(s)
    .replace(GERSHAYIM, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse a Hebrew Tanakh ref marker like "יחזקאל כג" or "יחזקאל כג:יד" or "(שם כז)".
 * For "שם" refs, pass context.lastBookCanon (the last explicit book in local context).
 * Returns null if the marker does not match a known Tanakh book + Hebrew numeral(s).
 */
export function parseTanakhRefHebrewFromMarker(
  marker: string,
  context?: { lastBookCanon: string }
): ParsedTanakhRef | null {
  if (!marker || typeof marker !== "string") return null;
  let raw = marker.trim();
  raw = expandTanakhAlias(raw);
  raw = normalizeForParse(raw);
  if (!raw) return null;

  // (שם כז) or (שם כז:יד) - contextual ref
  const shamMatch = raw.match(/^שם\s+(.+)/);
  if (shamMatch) {
    const lastBook = context?.lastBookCanon;
    if (!lastBook) return null;
    const remainder = shamMatch[1].trim();
    return parseChapterVerse(remainder, lastBook, raw, true);
  }

  // Pattern: <book> <chapter> [:<verse>]  or  <book> <chapter> [, <verse>]  or  <book> <chapter> <verse>
  const hebBooks = Object.keys(TANAKH_HEB_TO_CANONICAL).sort((a, b) => b.length - a.length);
  let workCanon: string | null = null;
  let remainder = raw;

  for (const heb of hebBooks) {
    const stripped = stripNiqqud(heb);
    if (remainder.startsWith(stripped) || remainder.startsWith(heb)) {
      const prefix = remainder.startsWith(stripped) ? stripped : heb;
      remainder = remainder.slice(prefix.length).trim();
      workCanon = TANAKH_HEB_TO_CANONICAL[heb];
      break;
    }
  }
  if (!workCanon || !remainder) return null;

  return parseChapterVerse(remainder, workCanon, raw, false);
}

function parseChapterVerse(
  remainder: string,
  workCanon: string,
  rawRefString: string,
  isSham: boolean
): ParsedTanakhRef | null {
  const colonMatch = remainder.match(/^([\dא-ת\"״׳'‎]+)\s*[:\u05F3]\s*([\dא-ת\"״׳'‎]+)/);
  const commaMatch = remainder.match(/^([\dא-ת\"״׳'‎]+)\s*,\s*([\dא-ת\"״׳'‎]+)/);
  const spaceMatch = remainder.match(/^([\dא-ת\"״׳'‎]+)\s+([\dא-ת\"״׳'‎]+)/);

  let chapterStr: string;
  let verseStr: string | undefined;

  if (colonMatch) {
    chapterStr = colonMatch[1].trim();
    verseStr = colonMatch[2].trim();
  } else if (commaMatch) {
    chapterStr = commaMatch[1].trim();
    verseStr = commaMatch[2].trim();
  } else if (spaceMatch) {
    chapterStr = spaceMatch[1].trim();
    verseStr = spaceMatch[2].trim();
  } else {
    chapterStr = remainder.replace(/[^\dא-ת\"״׳'‎]/g, "").trim() || remainder;
  }

  const chapter = parseHebrewNumeral(chapterStr) ?? parseInt(chapterStr, 10);
  if (!chapter || chapter < 1) return null;

  let verse: number | null = null;
  if (verseStr) {
    verse = parseHebrewNumeral(verseStr) ?? parseInt(verseStr, 10);
    if (!verse || verse < 1) verse = null;
  }

  const normalizedRefPrefix =
    verse != null ? `${workCanon} ${chapter}:${verse}` : `${workCanon} ${chapter}:`;

  return {
    workCanon,
    chapter,
    verse,
    normalizedRefPrefix,
    rawRefString,
    isSham,
  };
}
