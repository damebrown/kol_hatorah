import { log } from "console";
import { normalizeQueryInput } from "../../cli/utils/normalizeQuery";

const TRAILING_PUNCT_RE = /[?!.,:;]+$/;
const NIQQUD_RE = /[\u0591-\u05C7]/g; // Hebrew vowel points and cantillation

export function normalizeQueryForPlanning(raw: string): string {
  let q = normalizeQueryInput(raw);
  q = q.replace(NIQQUD_RE, "").trim();
  q = q.replace(TRAILING_PUNCT_RE, "").trim();
  return q;
}
