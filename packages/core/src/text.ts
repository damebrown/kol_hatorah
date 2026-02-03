export interface NormalizedText {
  textPlain: string;
  textNorm: string;
}

const HTML_TAG_RE = /<[^>]*>/g;
const DIACRITICS_RE = /[\u0591-\u05C7]/g; // Hebrew marks
const FINAL_MAP: Record<string, string> = {
  "ך": "כ",
  "ם": "מ",
  "ן": "נ",
  "ף": "פ",
  "ץ": "צ",
};
const PUNCTUATION_RE = /[“”"׳״'’,.–—\-·]/g;

export function normalizeText(input: string): NormalizedText {
  let textPlain = input.replace(HTML_TAG_RE, "");
  textPlain = textPlain.replace(/&thinsp;/g, " ");

  let textNorm = textPlain;
  textNorm = textNorm.replace(DIACRITICS_RE, "");
  textNorm = textNorm.replace(/[ךםןףץ]/g, (m) => FINAL_MAP[m] || m);
  textNorm = textNorm.replace(PUNCTUATION_RE, " ");
  textNorm = textNorm.replace(/\s+/g, " ").trim();

  return { textPlain: textPlain.trim(), textNorm };
}
