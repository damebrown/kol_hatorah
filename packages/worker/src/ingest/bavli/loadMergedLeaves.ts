import {
  buildExportSegmentRef,
  buildRefMappingContext,
  firstOuterIndexWithText,
  RefMappingContext,
} from "./refs";

export interface BavliMergedLeaf {
  text: string;
  exportRef: string;
  outerIndex: number;
  innerOneBased: number;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function flattenOuter(
  inner: unknown,
  work: string,
  outerIndex: number,
  ctx: RefMappingContext,
  out: BavliMergedLeaf[],
): void {
  if (!Array.isArray(inner)) return;
  for (let j = 0; j < inner.length; j++) {
    const cell = inner[j];
    if (typeof cell === "string") {
      const trimmed = cell.trim();
      if (!trimmed.length) continue;
      const innerOneBased = j + 1;
      out.push({
        text: trimmed,
        exportRef: buildExportSegmentRef(work, outerIndex, innerOneBased, ctx),
        outerIndex,
        innerOneBased,
      });
    } else if (Array.isArray(cell)) {
      flattenOuter(cell, work, outerIndex, ctx, out);
    }
  }
}

export function loadBavliLeavesFromMergedText(
  work: string,
  textRoot: unknown,
  ctx: RefMappingContext,
): BavliMergedLeaf[] {
  if (!Array.isArray(textRoot)) return [];
  const out: BavliMergedLeaf[] = [];
  for (let i = 0; i < textRoot.length; i++) {
    const outer = textRoot[i];
    if (!Array.isArray(outer)) continue;
    flattenOuter(outer, work, i, ctx, out);
  }
  return out;
}

export function resolveBavliRefContext(work: string, textRoot: unknown, bookLevelRef: string): RefMappingContext {
  const firstOuter = firstOuterIndexWithText(textRoot);
  if (firstOuter == null) {
    throw new Error(`No Hebrew text leaves in merged export for ${work}`);
  }
  return buildRefMappingContext(firstOuter, bookLevelRef);
}
