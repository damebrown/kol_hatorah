import { displayWorkName } from "./displayWorkName";
import { toHebrewNumeralDisplay } from "./hebrewNumerals";

/**
 * Format a Tanakh ref for Hebrew display: work + chapter:verse with gershayim.
 * Example: ("Ezekiel", "23:48") -> "יחזקאל כ״ג:מ״ח"
 */
export function formatTanakhRefHeb(work: string, ref: string): string {
  const w = displayWorkName(work.trim());
  const parts = (ref || "").split(":");
  const ch = parseInt(parts[0] || "0", 10);
  const v = parseInt(parts[1] || "0", 10);
  if (!ch) return `${w} ${ref}`;
  const chHeb = toHebrewNumeralDisplay(ch);
  const vHeb = v ? toHebrewNumeralDisplay(v) : "";
  return vHeb ? `${w} ${chHeb}:${vHeb}` : `${w} ${chHeb}`;
}
