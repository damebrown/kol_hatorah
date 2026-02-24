import { normalizeText } from "@kol-hatorah/core";
import { RefCandidate } from "../types/RefCandidate";
import { RefLink } from "../types/RefLink";
import { RefVerifyMethod } from "../types/RefVerifyMethod";
import { LINK_THRESHOLDS } from "../constants";

interface LinkOptions {
  targetTypes?: string[];
}

// NOTE: paths are placeholders; will fix imports after move.

export async function linkCandidate(
  candidate: RefCandidate,
  sqlite: any,
  options: LinkOptions = {}
): Promise<RefLink[]> {
  if (candidate.candidateKind === "EXPLICIT_REF") {
    return linkExplicit(candidate, sqlite, options);
  }
  return linkBySpan(candidate, sqlite, options);
}

async function linkExplicit(candidate: RefCandidate, sqlite: any, _options: LinkOptions): Promise<RefLink[]> {
  const refNorm = candidate.normalizedText;
  if (!refNorm) return [];
  // naive: try exact ref lookup
  const res = sqlite?.getRef ? sqlite.getRef(refNorm) : null;
  if (!res) return [];
  return [
    {
      candidateId: candidate.sourceSegmentId,
      targetSegmentId: res.id,
      targetType: res.type,
      targetWork: res.work,
      targetRef: res.ref,
      score: 1,
      verifier: RefVerifyMethod.EXACT_REF,
      status: "CONFIRMED",
    },
  ];
}

async function linkBySpan(candidate: RefCandidate, sqlite: any, options: LinkOptions): Promise<RefLink[]> {
  const norm = candidate.normalizedText;
  if (!norm) return [];
  const words = norm
    .split(/\s+/)
    .map((w) => w.replace(/[^\u0590-\u05FFa-zA-Z0-9]/g, "")) // strip punctuation, keep Hebrew + alphanumeric
    .filter((w) => w.length >= 2);
  if (!words.length) return [];
  // FTS5: use 2 most distinctive terms with AND (more terms can fail due to spelling variation)
  const terms = words.slice(0, 4).map((w) => `${w}*`);
  const query = terms.length >= 2 ? [terms[0], terms[1]].join(" AND ") : terms[0];
  if (!query) return [];
  const targets = options.targetTypes?.length ? options.targetTypes : ["tanakh", "mishnah"];
  const scope = { type: targets[0] as string };
  const rows: any[] = sqlite?.searchByMatch ? sqlite.searchByMatch(query, scope, 20) : [];
  const links: RefLink[] = [];
  const candidateWords = normalizeText(norm).textNorm.split(/\s+/).filter(Boolean).length;
  for (const row of rows) {
    const targetNorm = normalizeText(row.textPlain || "").textNorm;
    const shared = sharedWords(norm, targetNorm);
    const targetWords = targetNorm.split(/\s+/).filter(Boolean).length;
    const coverage = Math.max(shared / Math.max(1, candidateWords), shared / Math.max(1, targetWords));
    if (shared >= LINK_THRESHOLDS.MIN_SHARED_WORDS && coverage >= LINK_THRESHOLDS.MIN_SCORE) {
      links.push({
        candidateId: candidate.sourceSegmentId,
        targetSegmentId: row.id,
        targetType: row.type,
        targetWork: row.work,
        targetRef: row.ref,
        score: coverage,
        verifier: RefVerifyMethod.FTS_COVERAGE,
        status: "CONFIRMED",
        targetText: row.textPlain,
        debug: { shared, coverage },
      });
    }
  }
  return links.slice(0, LINK_THRESHOLDS.TOP_K);
}

function sharedWords(a: string, b: string): number {
  const sa = new Set(normalizeText(a).textNorm.split(/\s+/).filter(Boolean));
  const sb = new Set(normalizeText(b).textNorm.split(/\s+/).filter(Boolean));
  let count = 0;
  sa.forEach((w) => {
    if (sb.has(w)) count += 1;
  });
  return count;
}
