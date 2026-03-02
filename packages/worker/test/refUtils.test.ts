import assert from "assert";
import { parseSplitRef, compareSplitRefs } from "@kol-hatorah/core";

// parseSplitRef
const splitCase = parseSplitRef("abc123:0/Genesis/1 (part 2/3)");
assert.strictEqual(splitCase.isSplit, true);
assert.strictEqual(splitCase.baseRef, "abc123:0/Genesis/1");
assert.strictEqual(splitCase.partIndex, 2);
assert.strictEqual(splitCase.partCount, 3);

const nonSplitCase = parseSplitRef("abc123:0/Genesis/1");
assert.strictEqual(nonSplitCase.isSplit, false);
assert.strictEqual(nonSplitCase.baseRef, "abc123:0/Genesis/1");
assert.strictEqual(nonSplitCase.partIndex, undefined);
assert.strictEqual(nonSplitCase.partCount, undefined);

const plainRef = parseSplitRef("Genesis 1:1");
assert.strictEqual(plainRef.isSplit, false);
assert.strictEqual(plainRef.baseRef, "Genesis 1:1");

// compareSplitRefs
assert.strictEqual(compareSplitRefs("X (part 1/3)", "X (part 2/3)"), -1);
assert.strictEqual(compareSplitRefs("X (part 3/3)", "X (part 1/3)"), 2);
assert.strictEqual(compareSplitRefs("X (part 3/3)", "X (part 3/3)"), 0);
assert.strictEqual(compareSplitRefs("X", "Y"), 0); // both non-split, partIndex 0

console.log("refUtils tests passed");
