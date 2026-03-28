import assert from "assert";
import {
  buildExportSegmentRef,
  buildRefMappingContext,
  dafAmudFromSequential,
  firstOuterIndexWithText,
  formatDafAmud,
  parseLeadingDafFromBookRef,
  parseSegmentRefParts,
  sequentialFromDafAmud,
} from "../src/ingest/bavli/refs";

const berakhotLikeText = [[], [], ["seg1", "seg2"], ["a"]];

assert.strictEqual(firstOuterIndexWithText(berakhotLikeText), 2);

const ctx = buildRefMappingContext(2, "Berakhot 2a");
assert.strictEqual(buildExportSegmentRef("Berakhot", 2, 1, ctx), "Berakhot 2a:1");
assert.strictEqual(buildExportSegmentRef("Berakhot", 2, 2, ctx), "Berakhot 2a:2");
assert.strictEqual(buildExportSegmentRef("Berakhot", 3, 1, ctx), "Berakhot 2b:1");

const d = parseLeadingDafFromBookRef("Berakhot 2a");
assert(d);
assert.strictEqual(sequentialFromDafAmud(d), 0);
assert.strictEqual(formatDafAmud(dafAmudFromSequential(0)), "2a");
assert.strictEqual(formatDafAmud(dafAmudFromSequential(1)), "2b");

const parts = parseSegmentRefParts("Bava Kamma 15b:7");
assert(parts);
assert.strictEqual(parts.daf, "15");
assert.strictEqual(parts.amud, "b");
assert.strictEqual(parts.segmentNum, 7);

console.log("bavliRefs.test.ts OK");
