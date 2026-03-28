/**
 * Reduced Tanakh commentary corpus: only these Sefaria-style work titles (from merged.json `title`).
 * Must match `ALLOWLISTED_COMMENTARY_WORK_SQL` in `storage/sqlite/queries.ts` (LIKE patterns).
 */

const PREFIXES = [
  "Rashi on ",
  "Ramban on ",
  "Ibn Ezra on ",
  "Sforno on ",
  "Kli Yakar on ",
  "Klei Yakar on ",
] as const;

export function isAllowlistedTanakhCommentaryWork(work: string): boolean {
  const w = work.trim();
  for (const p of PREFIXES) {
    if (w.length >= p.length && w.slice(0, p.length).toLowerCase() === p.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/** English key for metadata (Kli Yakar vs Klei Yakar both → kli_yakar). */
export function tanakhCommentatorKeyFromWork(work: string): string | null {
  const w = work.trim();
  if (/^rashi\s+on\s+/i.test(w)) return "rashi";
  if (/^ramban\s+on\s+/i.test(w)) return "ramban";
  if (/^ibn ezra\s+on\s+/i.test(w)) return "ibn_ezra";
  if (/^sforno\s+on\s+/i.test(w)) return "sforno";
  if (/^kli yakar\s+on\s+/i.test(w) || /^klei yakar\s+on\s+/i.test(w)) return "kli_yakar";
  return null;
}

export function baseBookTitleFromCommentaryWork(work: string): string | null {
  const m = work.trim().match(/^(?:Rashi|Ramban|Ibn Ezra|Sforno|Kli Yakar|Klei Yakar)\s+on\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
