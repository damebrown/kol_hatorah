/**
 * Utilities for parsing split chunk refs (e.g. "baseRef (part 2/3)").
 */

const PART_SUFFIX_RE = /\s*\(part (\d+)\/(\d+)\)\s*$/;

export function parseSplitRef(ref: string): {
  isSplit: boolean;
  baseRef: string;
  partIndex?: number;
  partCount?: number;
} {
  const match = ref.match(PART_SUFFIX_RE);
  if (match) {
    return {
      isSplit: true,
      baseRef: ref.replace(PART_SUFFIX_RE, "").trim(),
      partIndex: parseInt(match[1], 10),
      partCount: parseInt(match[2], 10),
    };
  }
  return { isSplit: false, baseRef: ref };
}

export function compareSplitRefs(aRef: string, bRef: string): number {
  const a = parseSplitRef(aRef);
  const b = parseSplitRef(bRef);
  const aIdx = a.partIndex ?? 0;
  const bIdx = b.partIndex ?? 0;
  return aIdx - bIdx;
}
