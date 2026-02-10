export const QUOTE_CONSTANTS = {
  MAX_QUOTE_LEN_CHARS: 200,
  MIN_QUOTE_LEN_CHARS: 8,
  MIN_QUOTE_WORDS: 2,
  INTRO_FOLLOW_WINDOW: 140,
  OVERLAP_KEEP_ORDER: ["HIGH", "MEDIUM", "LOW"] as const,
  TANAKH_TOP_K: 5,
  TANAKH_MIN_SHARED_WORDS: 3,
  TANAKH_MIN_SCORE: 0.45,
};

export const INTRODUCERS = {
  mishnah: ["שנאמר", "שנאמר בו", "שנאמר עליו"],
  general: ["דכתיב", "כדכתיב", "שנאמר", "אמר קרא", "כתיב", "ככתוב"],
};
