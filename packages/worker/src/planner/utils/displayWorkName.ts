import { CANONICAL_TO_HEB_OVERRIDE } from "../scope/mappings/canonicalOverrides";
import { TANAKH_HEB_TO_CANONICAL } from "../scope/mappings/tanakhBooks";
import { MISHNAH_TRACTATES_HEB_TO_CANONICAL } from "../scope/mappings/mishnahTractates";
import { BAVLI_TRACTATES_HEB_TO_CANONICAL } from "../scope/mappings/bavliTractates";

const invertMap = (m: Record<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.entries(m).forEach(([he, en]) => {
    out[en] = he;
  });
  return out;
};

const CANONICAL_TO_HEB_TANAKH = invertMap(TANAKH_HEB_TO_CANONICAL);
const CANONICAL_TO_HEB_MISHNAH = invertMap(MISHNAH_TRACTATES_HEB_TO_CANONICAL);
const CANONICAL_TO_HEB_BAVLI = invertMap(BAVLI_TRACTATES_HEB_TO_CANONICAL);

export function displayWorkName(canonical: string): string {
  const base = canonical.replace(/^(Mishnah|Bavli)\s+/i, "").trim();
  if (CANONICAL_TO_HEB_OVERRIDE[base]) return CANONICAL_TO_HEB_OVERRIDE[base];
  if (CANONICAL_TO_HEB_TANAKH[base]) return CANONICAL_TO_HEB_TANAKH[base];
  if (CANONICAL_TO_HEB_MISHNAH[base]) return CANONICAL_TO_HEB_MISHNAH[base];
  if (CANONICAL_TO_HEB_BAVLI[base]) return CANONICAL_TO_HEB_BAVLI[base];
  return base || canonical;
}
