import assert from "assert";
import { parseRefFromQuery } from "../src/planner/utils/parseRefFromQuery";
import { formatMishnahRefHeb, parseChapterVerseFromSegmentRef } from "../src/planner/utils/formatMishnahRefHeb";

const registry = new Map<string, Set<string>>([["mishnah", new Set(["Mishnah Sotah", "Sotah"])]]);

function testParseSegmentRefSotah78() {
  const { chapter, mishnah } = parseChapterVerseFromSegmentRef("Sotah 7:8");
  assert.strictEqual(chapter, 7);
  assert.strictEqual(mishnah, 8);
}

function testParseSegmentRefMishnahSotah78() {
  const { chapter, mishnah } = parseChapterVerseFromSegmentRef("Mishnah Sotah 7:8");
  assert.strictEqual(chapter, 7);
  assert.strictEqual(mishnah, 8);
}

function testParseBare78() {
  const { chapter, mishnah } = parseChapterVerseFromSegmentRef("7:8");
  assert.strictEqual(chapter, 7);
  assert.strictEqual(mishnah, 8);
}

function testFormatSotah78() {
  const { chapter, mishnah } = parseChapterVerseFromSegmentRef("Sotah 7:8");
  const formatted = formatMishnahRefHeb("Sotah", chapter, mishnah);
  assert.strictEqual(formatted, "סוטה ז:ח");
}

function testParseHebrewNumeralRef() {
  const res = parseRefFromQuery("סוטה א:ו", registry as any);
  assert.ok(res);
  assert.strictEqual(res?.work, "Mishnah Sotah");
  assert.strictEqual(res?.chapter, 1);
  assert.strictEqual(res?.verse, 6);
}

function testParsePhrasing() {
  const res = parseRefFromQuery("משנה ז בסוטה א׳", registry as any);
  assert.ok(res);
  assert.strictEqual(res?.chapter, 1);
  assert.strictEqual(res?.verse, 7);
}

function testFormatMishnahRef() {
  const s = formatMishnahRefHeb("Mishnah Sotah", 1, 6);
  assert.strictEqual(s.includes("סוטה"), true);
  assert.strictEqual(s.includes("א:ו"), true);
  assert.strictEqual(s.includes("1:6"), false);
}

function run() {
  testParseSegmentRefSotah78();
  testParseSegmentRefMishnahSotah78();
  testParseBare78();
  testFormatSotah78();
  testParseHebrewNumeralRef();
  testParsePhrasing();
  testFormatMishnahRef();
  // eslint-disable-next-line no-console
  console.log("mishnahRefs tests passed");
}

run();
