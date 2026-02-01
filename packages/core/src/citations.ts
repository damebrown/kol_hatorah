import { Chunk } from "./types";

export interface Citation {
  work: string;
  ref: string;
}

export function displayCitation(citation: Citation): string {
  let ref = citation.ref;
  // Strip trailing dot-number suffix (e.g., ".20")
  ref = ref.replace(/\.\d+$/, "");

  // If ref already starts with work + space, don't prepend work
  if (ref.startsWith(`${citation.work} `)) {
    return ref;
  }

  return `${citation.work} ${ref}`;
}

export function deduplicateCitations(chunks: Chunk[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.work}|${chunk.ref}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({ work: chunk.work, ref: chunk.ref });
    }
  }
  return citations;
}

export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) {
    return "";
  }

  return citations.map((c, index) => `[${index + 1}] ${displayCitation(c)}`).join(", ");
}
