import { PREFIX_LETTERS } from "../../config/constants";

export function expandHebrewPrefixes(term: string): string[] {
  const set = new Set(Array.from(PREFIX_LETTERS).map((p) => `${p}${term}`));
  return Array.from(set);
}
