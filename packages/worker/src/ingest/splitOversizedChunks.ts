/**
 * Splits oversized chunks for embedding (text-embedding-3-small: 8192 token limit).
 * Applied before SQLite/Qdrant to avoid 400 context-length errors.
 */

import { createHash } from "crypto";

/** ~3000 chars ≈ 1500 tokens, safe for 8192 limit. Conservative for Hebrew (vowel points inflate tokens). */
export const MAX_EMBED_CHARS = 3000;

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

/**
 * Split long text into parts under maxChars.
 * Strategy: paragraph (\n\n) → line (\n) → fixed windows.
 */
export function splitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const parts: string[] = [];

  function addPart(p: string) {
    if (p.trim().length > 0) parts.push(p.trim());
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
            if (line.length <= maxChars) {
              lineAcc = line;
            } else {
              for (let i = 0; i < line.length; i += maxChars) {
                addPart(line.slice(i, i + maxChars));
              }
              lineAcc = "";
            }
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
