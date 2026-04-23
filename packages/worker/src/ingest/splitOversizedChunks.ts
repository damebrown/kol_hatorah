/**
 * Chunk splitting and grouping utilities for ingest.
 *
 * A5 changes:
 *  - MAX_EMBED_CHARS lowered to 900 (Cohere 512-token limit; Hebrew ~1.5 chars/token)
 *  - splitLongText: adds Hebrew clause-boundary split before fixed-window fallback
 *  - groupShortSegments: new — combines consecutive short se'ifim up to maxChars
 */

import { createHash } from "crypto";

/** Cohere embed-multilingual-v3.0: 512-token limit; Hebrew ~1.5 chars/token → 900 char safe window. */
export const MAX_EMBED_CHARS = 900;

/** Qdrant accepts UUID or integer. Hash partId to deterministic UUID format. */
function partIdToUuid(partId: string): string {
  const hex = createHash("sha256").update(partId).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export interface SplittableChunk {
  id: string;
  text: string;
  ref: string;
  normalizedRef?: string;
  work?: string;
}

// ─── Clause-boundary split ────────────────────────────────────────────────────

// Common halakhic clause separators followed by a Hebrew letter or end of string
const CLAUSE_SPLIT_RE = /(?::\s(?=[\u05D0-\u05EA])|(?<=[\u05D0-\u05EA\d])\.\s(?=[\u05D0-\u05EA])|\u05C3)/;

/**
 * Tries to split `text` at clause boundaries (': ', '. ', sof-pasuk) into
 * parts that each fit within maxChars. Returns null if no suitable boundary found.
 */
function splitAtClauseBoundaries(text: string, maxChars: number): string[] | null {
  const parts = text.split(CLAUSE_SPLIT_RE).filter((p) => p.trim().length > 0);
  if (parts.length <= 1) return null;

  const result: string[] = [];
  let current = "";

  for (const part of parts) {
    const candidate = current ? current + " " + part : part;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) result.push(current.trim());
      current = part;
    }
  }
  if (current) result.push(current.trim());

  // Only use this split if it actually helped (all parts fit)
  if (result.every((p) => p.length <= maxChars)) return result;
  return null;
}

/**
 * Split long text into parts under maxChars.
 * Strategy: paragraph (\n\n) → line (\n) → Hebrew clause boundaries (: . ׃) → fixed windows.
 */
export function splitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const parts: string[] = [];

  function addPart(p: string) {
    if (p.trim().length > 0) parts.push(p.trim());
  }

  function splitLine(line: string) {
    if (line.length <= maxChars) {
      addPart(line);
      return;
    }
    // Try clause boundaries before fixed windows
    const clauseParts = splitAtClauseBoundaries(line, maxChars);
    if (clauseParts) {
      for (const cp of clauseParts) splitLine(cp);
      return;
    }
    // Fixed-window fallback
    for (let i = 0; i < line.length; i += maxChars) {
      addPart(line.slice(i, i + maxChars));
    }
  }

  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const p of paragraphs) {
    const withSep = current ? current + "\n\n" + p : p;
    if (withSep.length <= maxChars) {
      current = withSep;
    } else {
      if (current) {
        addPart(current);
        current = "";
      }
      if (p.length <= maxChars) {
        current = p;
      } else {
        const lines = p.split(/\n+/);
        let lineAcc = "";
        for (const line of lines) {
          const withLine = lineAcc ? lineAcc + "\n" + line : line;
          if (withLine.length <= maxChars) {
            lineAcc = withLine;
          } else {
            if (lineAcc) addPart(lineAcc);
            splitLine(line);
            lineAcc = "";
          }
        }
        if (lineAcc) addPart(lineAcc);
      }
    }
  }
  if (current) addPart(current);

  return parts.length > 0 ? parts : [text.slice(0, maxChars)];
}

/**
 * Groups consecutive short segments from the same siman (same ref prefix up to
 * the last ':') up to maxChars. Reduces vector count for Mishneh Torah /
 * Shulchan Arukh where each se'if is a separate export segment.
 *
 * The grouped segment takes the ref of the first constituent. When multiple
 * constituents are merged, the ref is extended with '–<last-verse>' to
 * indicate the range (e.g. "Berakhot 1:1" + "Berakhot 1:2" → "Berakhot 1:1–2").
 */
export function groupShortSegments<T extends { text: string; ref: string }>(
  segments: T[],
  maxChars: number
): T[] {
  if (segments.length === 0) return [];

  function simanPrefix(ref: string): string {
    const lastColon = ref.lastIndexOf(":");
    return lastColon >= 0 ? ref.slice(0, lastColon) : ref;
  }

  function lastVerse(ref: string): string {
    const lastColon = ref.lastIndexOf(":");
    return lastColon >= 0 ? ref.slice(lastColon + 1) : "";
  }

  const result: T[] = [];
  let groupStart = segments[0];
  let groupText = segments[0].text;
  let groupLastRef = segments[0].ref;
  let groupCount = 1;

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const candidate = groupText + " " + seg.text;

    const sameParent = simanPrefix(seg.ref) === simanPrefix(groupStart.ref);

    if (sameParent && candidate.length <= maxChars) {
      groupText = candidate;
      groupLastRef = seg.ref;
      groupCount++;
    } else {
      const groupRef =
        groupCount > 1
          ? `${groupStart.ref}–${lastVerse(groupLastRef)}`
          : groupStart.ref;
      result.push({ ...groupStart, text: groupText, ref: groupRef } as T);
      groupStart = seg;
      groupText = seg.text;
      groupLastRef = seg.ref;
      groupCount = 1;
    }
  }

  // Flush final group
  const groupRef =
    groupCount > 1 ? `${groupStart.ref}–${lastVerse(groupLastRef)}` : groupStart.ref;
  result.push({ ...groupStart, text: groupText, ref: groupRef } as T);

  return result;
}

/**
 * Expand oversized chunks into multiple sub-chunks.
 * Sub-chunk id: originalId::part-0001, ref: originalRef (part 1/N).
 */
export function splitOversizedChunks<T extends { id: string; text: string; ref: string; normalizedRef?: string; work?: string }>(
  chunks: T[],
  maxChars: number,
  logger?: { info: (o: object, msg?: string) => void }
): T[] {
  const result: T[] = [];
  let splitCount = 0;

  for (const c of chunks) {
    if (c.text.length <= maxChars) {
      result.push(c);
      continue;
    }

    const parts = splitLongText(c.text, maxChars);
    splitCount += 1;

    if (logger) {
      logger.info(
        {
          id: c.id,
          ref: c.ref,
          work: (c as any).work,
          textLen: c.text.length,
          parts: parts.length,
          preview: c.text.slice(0, 200).replace(/\n/g, " "),
        },
        "Split oversized chunk"
      );
    }

    for (let i = 0; i < parts.length; i++) {
      const partNum = i + 1;
      const partIdSuffix = `${c.id}::part-${String(partNum).padStart(4, "0")}`;
      const partRef = parts.length > 1 ? `${c.ref} (part ${partNum}/${parts.length})` : c.ref;
      const id = partIdToUuid(partIdSuffix);

      result.push({
        ...c,
        id,
        text: parts[i],
        ref: partRef,
        normalizedRef: partRef,
      } as T);
    }
  }

  if (splitCount > 0 && logger) {
    logger.info({ splitCount, totalBefore: chunks.length, totalAfter: result.length }, "Chunk splitting summary");
  }

  return result;
}
