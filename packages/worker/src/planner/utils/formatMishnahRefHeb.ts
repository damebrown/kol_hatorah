import { displayWorkName } from "./displayWorkName";
import { toHebrewNumeralDisplay } from "./hebrewNumerals";

/**
 * Parse chapter and mishnah from segment ref.
 * Segment ref from DB is full format like "Sotah 7:8" or "Mishnah Sotah 7:8".
 * BUG FIX: Previously we did split(":") on "Sotah 7:8" → ["Sotah 7","8"] → ch=NaN, mish=8,
 * and (NaN||1)=1, so every hit showed chapter 1. Now we extract the last "chapter:verse" correctly.
 */
export function parseChapterVerseFromSegmentRef(ref: string): { chapter: number; mishnah: number } {
  const match = (ref || "").match(/(\d+):(\d+)$/);
  if (match) {
    return { chapter: parseInt(match[1], 10), mishnah: parseInt(match[2], 10) };
  }
  return { chapter: 1, mishnah: 1 };
}

export function formatMishnahRefHeb(work: string, chapter: number, mishnah: number): string {
  const w = displayWorkName(work);
  const ch = toHebrewNumeralDisplay(chapter);
  const m = toHebrewNumeralDisplay(mishnah);
  return `${w} ${ch}:${m}`;
}
