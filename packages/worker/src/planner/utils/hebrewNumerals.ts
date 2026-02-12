const ones: Record<number, string> = {
  1: "א",
  2: "ב",
  3: "ג",
  4: "ד",
  5: "ה",
  6: "ו",
  7: "ז",
  8: "ח",
  9: "ט",
};

const tens: Record<number, string> = {
  10: "י",
  20: "כ",
  30: "ל",
  40: "מ",
  50: "נ",
  60: "ס",
  70: "ע",
  80: "פ",
  90: "צ",
};

const hundreds: Record<number, string> = {
  100: "ק",
  200: "ר",
  300: "ש",
  400: "ת",
};

export function numberToHebrew(num: number): string {
  if (num <= 0) return num.toString();
  if (num === 15) return "טו";
  if (num === 16) return "טז";
  let n = num;
  let res = "";
  const hKeys = Object.keys(hundreds)
    .map(Number)
    .sort((a, b) => b - a);
  for (const h of hKeys) {
    while (n >= h) {
      res += hundreds[h];
      n -= h;
    }
  }
  const tKeys = Object.keys(tens)
    .map(Number)
    .sort((a, b) => b - a);
  for (const t of tKeys) {
    if (n >= t) {
      res += tens[t];
      n -= t;
      break;
    }
  }
  if (n > 0) res += ones[n] || "";
  if (res.length === 1) return `${res}'`;
  const last = res.slice(-1);
  const body = res.slice(0, -1);
  return `${body}״${last}`;
}

export function formatHebrewRef(ref: string): string {
  const m = ref.match(/^(.*?)[\s]+(\d+):(\d+)$/);
  if (!m) return ref;
  const work = m[1];
  const chapter = parseInt(m[2], 10);
  const verse = parseInt(m[3], 10);
  return `${work} ${numberToHebrew(chapter)}:${numberToHebrew(verse)}`;
}
