/**
 * Quote window extraction for Mishnah → Tanakh verse matching.
 *
 * The Mishnah cites Tanakh in various patterns:
 * - "שנאמר (יחזקאל כג) ונוסרו כל הנשים" — quote AFTER marker
 * - "כדכתיב (דברים יז) שום תשים" — quote can be before or after introducer
 * - "וברכות וקללות (שם כח) עד שגומר כל הפרשה" — boilerplate after marker, no verse quote
 *
 * We extract a substring that likely contains the verse; if only boilerplate, return empty.
 */

import { MISHNAH_PAREN_REFS } from "../../config/mishnahParenRefs";

/** Phrases that typically introduce a verse quote (quote usually follows or precedes). */
const INTRODUCERS = [
  "שנאמר",
  "דכתיב",
  "כדכתיב",
  "כמו שנאמר",
  "שכתוב",
  "כשכתוב",
  "וכתוב",
  "כתיב",
];

/** Boilerplate phrases that are NOT verse quotes (low signal). */
const BOILERPLATE = [
  "עד שגומר כל הפרשה",
  "עד שגומר",
  "כל הפרשה",
  "כדכתיב",
  "שנאמר",
  "דכתיב",
  "כמו שנאמר",
  "כמו שכתוב",
  "הוא אומר",
  "ואומר",
  "ועונה",
  "וכותב",
  "משום",
];

const MAQAF = "\u05BE"; // Hebrew maqaf
const SOF_PASUQ = "\u05C3"; // Sof pasuq

function stripHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function removeBracketVariants(s: string): string {
  return s.replace(/\s*\[[^\]]*\]\s*/g, " ");
}

function normalizeForMatching(s: string): string {
  let t = stripHtmlEntities(s);
  t = t.replace(new RegExp(MAQAF, "g"), " ");
  t = removeBracketVariants(t);
  t = t.replace(/[\u0591-\u05C7]/g, ""); // niqqud/cantillation
  t = t.replace(/[ךםןףץ]/g, (m) => ({ "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" }[m] ?? m));
  t = t.replace(/[""׳״'’,.–—\-·\u05C3]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

/** Check if text is predominantly boilerplate (not a verse quote). */
function isBoilerplate(text: string): boolean {
  const norm = normalizeForMatching(text);
  const tokens = norm.split(/\s+/).filter(Boolean);
  if (tokens.length < 3) return true;
  for (const bp of BOILERPLATE) {
    if (norm.includes(bp) && tokens.length <= 8) return true;
  }
  return false;
}

/** Extract text after closing paren, bounded by punctuation. */
function extractAfter(mishnahText: string, spanEnd: number, maxChars: number): string {
  const after = mishnahText.slice(spanEnd).trimStart().slice(0, maxChars);
  const stopAt = /[.:—\-\u05BE\u05C3]/.exec(after);
  return (stopAt ? after.slice(0, stopAt.index) : after).trim();
}

/** Extract text before opening paren. */
function extractBefore(mishnahText: string, spanStart: number, maxChars: number): string {
  const before = mishnahText.slice(Math.max(0, spanStart - maxChars), spanStart).trimEnd();
  const stopAt = /[.:—\-\u05BE\u05C3]/.exec(before);
  const start = stopAt ? stopAt.index! + 1 : 0;
  return before.slice(start).trim();
}

/** Check if text before marker starts with an introducer (quote may be immediately after it). */
function hasIntroducerBefore(text: string): boolean {
  const norm = normalizeForMatching(text);
  return INTRODUCERS.some((i) => norm.includes(i));
}

/**
 * Extract the quote window from Mishnah text for verse matching.
 * Tries both before and after the marker; prefers the window that looks more like a verse quote.
 */
export function extractQuoteWindow(
  mishnahText: string,
  spanStart: number,
  spanEnd: number
): string {
  const { QUOTE_WINDOW_MIN, QUOTE_WINDOW_MAX } = MISHNAH_PAREN_REFS;
  const beforeChars = Math.min(100, QUOTE_WINDOW_MAX);
  const afterChars = QUOTE_WINDOW_MAX;

  const after = extractAfter(mishnahText, spanEnd, afterChars);
  const before = extractBefore(mishnahText, spanStart, beforeChars);

  if (after.length >= QUOTE_WINDOW_MIN && !isBoilerplate(after)) {
    return after;
  }
  if (before.length >= QUOTE_WINDOW_MIN && hasIntroducerBefore(before)) {
    const afterIntroducer = before.split(/\s+/).slice(-12).join(" ");
    if (!isBoilerplate(afterIntroducer)) return afterIntroducer;
  }
  if (before.length >= QUOTE_WINDOW_MIN && !isBoilerplate(before)) {
    return before;
  }
  if (after.length >= QUOTE_WINDOW_MIN && !isBoilerplate(after)) {
    return after;
  }
  return "";
}

export { normalizeForMatching, isBoilerplate };
