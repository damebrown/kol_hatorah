/**
 * Generic recursive extractor for Sefaria commentary merged.json text structures.
 * Supports: list depth 2/3, dict roots with varying value depths.
 */

export type SectionPathComponent = number | string;

const EMPTY_KEY_PLACEHOLDER = "<EMPTY_KEY>";

function normalizeKey(k: string): string {
  return k === "" ? EMPTY_KEY_PLACEHOLDER : k;
}

/**
 * Encode sectionPath for ref: join by '/', numbers as `${n}`, strings as encodeURIComponent.
 */
export function encodeSectionPath(sectionPath: SectionPathComponent[]): string {
  return sectionPath
    .map((c) => (typeof c === "number" ? `${c}` : encodeURIComponent(c)))
    .join("/");
}

export interface LeafSegment {
  sectionPath: SectionPathComponent[];
  text: string;
}

function* walkText(
  node: unknown,
  path: SectionPathComponent[] = []
): Generator<LeafSegment> {
  if (node === null || typeof node === "number" || typeof node === "boolean") {
    return;
  }
  if (typeof node === "string") {
    const trimmed = node.trim();
    if (trimmed.length > 0) {
      yield { sectionPath: path, text: trimmed };
    }
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      yield* walkText(node[i], [...path, i]);
    }
    return;
  }
  if (typeof node === "object" && node !== null) {
    const obj = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      const normKey = normalizeKey(key);
      yield* walkText(value, [...path, normKey]);
    }
  }
}

/**
 * Extract all leaf text segments from a Sefaria merged.json text node.
 */
export function* extractCommentaryLeaves(text: unknown): Generator<LeafSegment> {
  yield* walkText(text);
}
