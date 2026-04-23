/**
 * A2 — Inline scripture ref extractor
 *
 * Strips parenthetical scripture citations embedded in Hebrew text and
 * returns them as structured metadata.
 *
 * Input:  "שֶׁנֶּאֱמַר (דברים כב) לֹא תִלְבַּשׁ"
 * Output: { cleanText: "שֶׁנֶּאֱמַר  לֹא תִלְבַּשׁ", refs: ["דברים כב"] }
 *
 * Ibid resolution: (שם N) is resolved to LAST_BOOK N where LAST_BOOK is the
 * most recently extracted named book in the same segment. If no prior book
 * has been seen, the parenthetical is left intact (not extracted).
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

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Chapter/verse suffix: Hebrew letter-numerals, Arabic digits, colons, commas, spaces, dashes
const LOCATION_SUFFIX = "[\\u05D0-\\u05EA\\d\\s,:,\\-\u2013]{0,30}";

const BOOK_ALTERNATION = KNOWN_BOOKS.map(escapeRe).join("|");

/**
 * Combined pattern (two alternatives):
 *   Group 1: named-book ref — (BOOK_NAME LOCATION)
 *   Group 2: ibid suffix    — (שם SUFFIX) where שם = "ibid"
 */
const COMBINED_RE = new RegExp(
  `\\(((?:${BOOK_ALTERNATION})${LOCATION_SUFFIX})\\)|\\(\u05E9\u05DD([^)]{0,30})\\)`,
  "g"
);

/** Extract the leading book name from a fully-matched ref string. */
function extractBookFromRef(ref: string): string | null {
  for (const book of KNOWN_BOOKS) {
    if (ref === book || ref.startsWith(book + " ") || ref.startsWith(book + ",")) {
      return book;
    }
  }
  return null;
}

/**
 * Extracts parenthetical scripture refs from Hebrew text.
 * Named refs are anchored to known Tanakh/Mishnah book names.
 * Ibid citations (שם N) are resolved to the last extracted book + location.
 */
export function extractInlineRefs(text: string): ExtractInlineRefsResult {
  if (!text) return { cleanText: text, refs: [] };

  const refs: string[] = [];
  let lastBook: string | null = null;

  COMBINED_RE.lastIndex = 0;

  const cleanText = text.replace(COMBINED_RE, (match, namedRef?: string, ibidSuffix?: string) => {
    if (namedRef !== undefined) {
      const ref = namedRef.trim();
      refs.push(ref);
      const book = extractBookFromRef(ref);
      if (book) lastBook = book;
      return "";
    }

    // ibidSuffix is defined — this is a (שם ...) match
    if (lastBook === null) {
      // No prior book context: leave the parenthetical intact
      return match;
    }
    const suffix = (ibidSuffix ?? "").replace(/^[,\s]+/, "").trim();
    const resolved = suffix ? `${lastBook} ${suffix}` : lastBook;
    refs.push(resolved);
    return "";
  });

  return { cleanText, refs };
}
