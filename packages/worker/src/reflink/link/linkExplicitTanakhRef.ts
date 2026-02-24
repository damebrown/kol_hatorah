import { RefCandidate } from "../types/RefCandidate";
import { RefLink } from "../types/RefLink";
import { RefVerifyMethod } from "../types/RefVerifyMethod";
import { parseTanakhRefHebrewFromMarker } from "../parseTanakhRefHebrew";

/**
 * Links a Mishnah parenthetical Tanakh ref candidate to Tanakh segments via SQLite.
 * Uses normalizedRef (exact) or normalizedRefPrefix (chapter-level) - no FTS.
 */
export function linkExplicitTanakhRef(candidate: RefCandidate, sqlite: any, context?: { lastBookCanon: string | null }): RefLink[] {
  const parsed = candidate.parsedRef
    ? {
        workCanon: candidate.parsedRef.workCanon,
        chapter: candidate.parsedRef.chapter,
        verse: candidate.parsedRef.verse,
        normalizedRefPrefix: candidate.parsedRef.normalizedRefPrefix,
      }
    : (() => {
        const raw = candidate.rawRefString ?? candidate.rawText;
        if (!raw) return null;
        return parseTanakhRefHebrewFromMarker(raw, context?.lastBookCanon ? { lastBookCanon: context.lastBookCanon } : undefined);
      })();

  if (!parsed) return [];

  const scope = { type: "tanakh" as string };
  const links: RefLink[] = [];

  if (parsed.verse != null) {
    const normalizedRef = `${parsed.workCanon} ${parsed.chapter}:${parsed.verse}`;
    const row = sqlite?.getRef?.(normalizedRef);
    if (row) {
      links.push({
        candidateId: candidate.sourceSegmentId,
        targetSegmentId: row.id,
        targetType: row.type,
        targetWork: row.work,
        targetRef: row.ref,
        score: 1,
        verifier: RefVerifyMethod.EXACT_REF,
        status: "CONFIRMED",
        targetText: row.textPlain,
      });
    }
  } else {
    const limit = 200;
    const rows = sqlite?.getByPrefix?.(parsed.normalizedRefPrefix, scope, limit) ?? [];
    if (rows.length > 0) {
      const first = rows[0];
      links.push({
        candidateId: candidate.sourceSegmentId,
        targetSegmentId: first.id,
        targetType: first.type,
        targetWork: first.work,
        targetRef: `${parsed.chapter}`,
        score: 1,
        verifier: RefVerifyMethod.EXACT_REF,
        status: "CONFIRMED",
        targetText: first.textPlain,
        chapterVerses: rows,
      });
    }
  }

  return links;
}
