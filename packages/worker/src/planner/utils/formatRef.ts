import { displayWorkName } from "./displayWorkName";

export function formatRef(work: string | undefined, ref: string): string {
  if (!work) return ref;
  const wCanon = work.trim();
  const wHeb = displayWorkName(wCanon);
  const r = ref.trim();
  const stripPrefixes = (txt: string, candidates: string[]): string => {
    for (const c of candidates) {
      if (txt.startsWith(c)) return txt.slice(c.length).trim();
    }
    return txt;
  };
  const candidatesToStrip = [wCanon, displayWorkName(wCanon)];
  const withoutCanon = stripPrefixes(r, candidatesToStrip);
  if (withoutCanon.startsWith(wHeb)) return withoutCanon;
  return `${wHeb} ${withoutCanon}`;
}
