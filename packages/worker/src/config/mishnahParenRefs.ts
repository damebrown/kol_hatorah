/** Tunable constants for Mishnah parenthetical ref pipeline (deterministic, no LLM). */
export const MISHNAH_PAREN_REFS = {
  /** Page size when fetching segments (full tractate scan). */
  SEGMENT_PAGE_SIZE: 500,
  /** Min chars after marker to extract as quote window. */
  QUOTE_WINDOW_MIN: 8,
  /** Max chars after marker for quote window. */
  QUOTE_WINDOW_MAX: 120,
  /** Min shared significant tokens to confirm verse match. Never confirm on 1. */
  MIN_SHARED_TOKENS: 3,
  /** Min score (0–1) to confirm verse. */
  MIN_SCORE_CONFIRMED: 0.35,
  /** When quoteTokens < this, require contiguous match of MIN_CONTIGUOUS_FOR_LOW. */
  QUOTE_TOKENS_LOW_THRESHOLD: 6,
  /** Min contiguous token match when quoteTokens is low. */
  MIN_CONTIGUOUS_FOR_LOW: 3,
  /** Bonus added to score for contiguous n-gram (0–0.2). */
  CONTIGUOUS_BONUS_MAX: 0.15,
  /** Max verses to return when ambiguous (above threshold). */
  MAX_AMBIGUOUS_RESULTS: 3,
  /** Excerpt padding around marker (chars). */
  EXCERPT_PAD: 80,
  /** Default display limit for this intent (Mishnah paren refs). */
  DISPLAY_LIMIT: 50,
  /** Top N candidate verses to show in debug-reflink. */
  DEBUG_TOP_N: 10,
};
