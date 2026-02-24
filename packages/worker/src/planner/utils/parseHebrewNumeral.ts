import { numberToHebrew } from "./hebrewNumerals";

const ONES: Record<string, number> = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
};

const TENS: Record<string, number> = {
  י: 10,
  כ: 20,
  ל: 30,
  מ: 40,
  נ: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  צ: 90,
};

const HUNDREDS: Record<string, number> = {
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
};

const STRIP_MARKS = /[\"״׳'‎]/g;

// Exported parser (Hebrew -> int)
export function parseHebrewNumeral(token: string): number | null {
  if (!token) return null;
  const clean = token.replace(STRIP_MARKS, "").trim();
  let sum = 0;
  for (const ch of clean) {
    if (ONES[ch]) sum += ONES[ch];
    else if (TENS[ch]) sum += TENS[ch];
    else if (HUNDREDS[ch]) sum += HUNDREDS[ch];
    else return null;
  }
  return sum > 0 ? sum : null;
}

// Convenience encoder (int -> Hebrew, default single-letter without geresh for 1-9)
export function toHebrewNumeral(num: number, opts: { singleWithoutGeresh?: boolean } = { singleWithoutGeresh: true }): string {
  return numberToHebrew(num, opts);
}
