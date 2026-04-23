/**
 * A2 — Inline scripture ref extractor
 *
 * Strips parenthetical scripture citations embedded in Hebrew text and
 * returns them as structured metadata.
 *
 * Input:  "שֶׁנֶּאֱמַר (דברים כב) לֹא תִלְבַּשׁ"
 * Output: { cleanText: "שֶׁנֶּאֱמַר  לֹא תִלְבַּשׁ", refs: ["דברים כב"] }
 */

import { TANAKH_HEB_TO_CANONICAL } from "../planner/scope/mappings/tanakhBooks";
import { MISHNAH_TRACTATES_HEB_TO_CANONICAL } from "../planner/scope/mappings/mishnahTractates";

export interface ExtractInlineRefsResult {
  cleanText: string;
  refs: string[];
}

// ─── Known Hebrew book/tractate names sorted longest-first to avoid prefix clash ─

const KNOWN_BOOKS: string[] = [
  ...Object.keys(TANAKH_HEB_TO_CANONICAL),
  ...Object.keys(MISHNAH_TRACTATES_HEB_TO_CANONICAL),
].sort((a, b) => b.length - a.length);

// Escape a string for use in a regex
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Chapter/verse suffix: Hebrew letter-numerals, Arabic digits, colons, commas, spaces, dashes
const LOCATION_SUFFIX = "[\\u05D0-\\u05EA\\d\\s,:,\\-\u2013]{0,30}";

// Build one alternation of all book names, longest first (already sorted)
const BOOK_ALTERNATION = KNOWN_BOOKS.map(escapeRe).join("|");

// Full pattern: (bookName optionalLocation)
// Captures group 1 = the inner text (without parens)
const INLINE_REF_RE = new RegExp(
  `\\(((?:${BOOK_ALTERNATION})${LOCATION_SUFFIX})\\)`,
  "g"
);

/**
 * Extracts parenthetical scripture refs from Hebrew text.
 * Only matches when the parenthetical starts with a known Tanakh book or
 * Mishnah tractate name; arbitrary parentheticals are left untouched.
 */
export function extractInlineRefs(text: string): ExtractInlineRefsResult {
  if (!text) return { cleanText: text, refs: [] };

  const refs: string[] = [];
  // Reset lastIndex since the regex is stateful (global flag)
  INLINE_REF_RE.lastIndex = 0;

  const cleanText = text.replace(INLINE_REF_RE, (_, inner: string) => {
    refs.push(inner.trim());
    return "";
  });

  return { cleanText, refs };
}
