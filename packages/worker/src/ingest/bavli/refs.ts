/**
 * Bavli merged.json uses a depth-2 jagged array: text[dafIndex][segmentIndex] = string.
 * Outer indices align with Sefaria's sequential Daf sections (2a, 2b, 3a, …), not numeric 2:1 refs.
 * See verified export sample: github.com/Sefaria/Sefaria-Export/.../Berakhot/Hebrew/merged.json
 * (first non-empty outer index is 2 → Berakhot 2a).
 */

export type DafAmud = { daf: number; amud: "a" | "b" };

const DAF_AMUD_TAIL = /^(\d+)([ab])$/;

export function parseDafAmudToken(token: string): DafAmud | null {
  const m = token.trim().match(DAF_AMUD_TAIL);
  if (!m) return null;
  return { daf: parseInt(m[1], 10), amud: m[2] as "a" | "b" };
}

/** e.g. "Berakhot 2a" → { daf: 2, amud: "a" } */
export function parseLeadingDafFromBookRef(bookRef: string): DafAmud | null {
  const parts = bookRef.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return parseDafAmudToken(parts[parts.length - 1]);
}

/** Vilna-style sequential amud counter: 2a→0, 2b→1, 3a→2, … */
export function sequentialFromDafAmud(d: DafAmud): number {
  return (d.daf - 2) * 2 + (d.amud === "b" ? 1 : 0);
}

export function dafAmudFromSequential(sequential: number): DafAmud {
  const daf = 2 + Math.floor(sequential / 2);
  const amud: "a" | "b" = sequential % 2 === 0 ? "a" : "b";
  return { daf, amud };
}

export function formatDafAmud(d: DafAmud): string {
  return `${d.daf}${d.amud}`;
}

/** First outer index that contains at least one non-empty string leaf. */
export function firstOuterIndexWithText(textRoot: unknown): number | null {
  if (!Array.isArray(textRoot)) return null;
  for (let i = 0; i < textRoot.length; i++) {
    if (outerNodeHasStringLeaf(textRoot[i])) return i;
  }
  return null;
}

function outerNodeHasStringLeaf(node: unknown): boolean {
  if (typeof node === "string") return node.trim().length > 0;
  if (!Array.isArray(node)) return false;
  for (const x of node) {
    if (outerNodeHasStringLeaf(x)) return true;
  }
  return false;
}

export function buildExportSegmentRef(work: string, outerIndex: number, innerOneBased: number, ctx: RefMappingContext): string {
  const sequential = ctx.baseSequential + (outerIndex - ctx.firstOuterIndex);
  const da = dafAmudFromSequential(sequential);
  return `${work} ${formatDafAmud(da)}:${innerOneBased}`;
}

export interface RefMappingContext {
  firstOuterIndex: number;
  baseSequential: number;
}

export function buildRefMappingContext(firstOuterIndex: number, bookLevelRef: string): RefMappingContext {
  const d = parseLeadingDafFromBookRef(bookLevelRef);
  if (d == null) {
    throw new Error(`Cannot parse first daf from book ref: ${bookLevelRef}`);
  }
  return {
    firstOuterIndex,
    baseSequential: sequentialFromDafAmud(d),
  };
}

/** Segment-level: "Berakhot 2a:1" / "Bava Kamma 2a:1" → parts for DB columns */
export function parseSegmentRefParts(
  canonicalRef: string,
): { daf: string; amud: string; segmentNum: number } | null {
  const t = canonicalRef.trim();
  const m = t.match(/(\d+)([ab]):(\d+)$/);
  if (!m || m.index === undefined) return null;
  return { daf: m[1], amud: m[2], segmentNum: parseInt(m[3], 10) };
}
