import assert from "assert";
import { expandSplitChunks } from "../src/cli/commands/ask";
import type { Chunk } from "@kol-hatorah/core";

const baseRef = "abc123:0/Genesis/1";

const mockSqlite = {
  getSegmentsByBaseRef: (ref: string, _type: string) => {
    if (ref !== baseRef) return [];
    return [
      { ref: `${baseRef} (part 1/3)`, textPlain: "Part one text.", work: "Commentary", type: "tanakh_commentary" },
      { ref: `${baseRef} (part 2/3)`, textPlain: "Part two text.", work: "Commentary", type: "tanakh_commentary" },
      { ref: `${baseRef} (part 3/3)`, textPlain: "Part three text.", work: "Commentary", type: "tanakh_commentary" },
    ];
  },
};

function makeChunk(ref: string, text: string): Chunk {
  return {
    id: "id-" + ref,
    text,
    source: "sefaria",
    type: "tanakh_commentary",
    work: "Commentary",
    ref,
    normalizedRef: ref,
    lang: "he",
    createdAt: "2025-01-01T00:00:00.000Z",
  };
}

// Input: only part 2/3 from vector search
const chunks: Chunk[] = [
  makeChunk(`${baseRef} (part 2/3)`, "Part two text."),
];

const scores = [0.9];

const { expandedChunks, expandedScores } = expandSplitChunks(chunks, scores, mockSqlite);

assert.strictEqual(expandedChunks.length, 1);
assert.strictEqual(expandedChunks[0].ref, baseRef);
assert.strictEqual(expandedChunks[0].normalizedRef, baseRef);
assert.strictEqual(
  expandedChunks[0].text,
  "Part one text.\n\nPart two text.\n\nPart three text."
);
assert.strictEqual(expandedScores[0], 0.9);

// Non-split chunk passes through
const nonSplitChunk = makeChunk("Genesis 1:1", "In the beginning");
const { expandedChunks: c2, expandedScores: s2 } = expandSplitChunks(
  [nonSplitChunk],
  [0.8],
  mockSqlite
);
assert.strictEqual(c2.length, 1);
assert.strictEqual(c2[0].ref, "Genesis 1:1");
assert.strictEqual(c2[0].text, "In the beginning");
assert.strictEqual(s2[0], 0.8);

console.log("expandSplitChunks tests passed");
