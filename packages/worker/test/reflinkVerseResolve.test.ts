/**
 * Unit tests for Mishnah → Tanakh verse resolution pipeline.
 */
import assert from "assert";
import { resolveVerseFromChapter } from "../src/reflink/resolveVerseFromQuote";
import { extractQuoteWindow, normalizeForMatching } from "../src/reflink/quoteWindow/extractQuoteWindow";

function testNormalizeHebrewRemovesNiqqud() {
  const input = "וְנֻסְּר֖וּ";
  const out = normalizeForMatching(input);
  const niqqudPattern = /[\u0591-\u05C7]/;
  assert.ok(!niqqudPattern.test(out), `output should have no niqqud/cantillation, got: ${JSON.stringify(out)}`);
  assert.ok(out.length >= 3 && /[\u05D0-\u05EA]/.test(out));
}

function testNormalizeHebrewRemovesHtmlEntities() {
  const input = "כל&nbsp;הנשים&amp;";
  const out = normalizeForMatching(input);
  assert.ok(!out.includes("&nbsp;"));
  assert.ok(!out.includes("&amp;"));
}

function testNormalizeHebrewRemovesBracketVariants() {
  const input = "כל [הָאֲסוּרִים] הנשים";
  const out = normalizeForMatching(input);
  assert.ok(!out.includes("["));
  assert.ok(!out.includes("]"));
}

function testScoreThresholdMustConfirm() {
  const quoteWindow = "ונוסרו כל הנשים";
  const chapterVerses = [
    { ref: "23:14", textPlain: "ונוסרו כל הנשים ולא תעשנה", verseNum: 14 },
  ];
  const { resolved, debug } = resolveVerseFromChapter(
    quoteWindow,
    chapterVerses,
    "Ezekiel",
    23,
    undefined,
    { collectDebug: true }
  );
  assert.ok(resolved.length >= 1);
  assert.strictEqual(resolved[0].verseNum, 14);
  const c = debug?.candidates[0];
  assert.ok(c, "expected candidate");
  assert.ok(c!.score >= 0.35);
  assert.ok(c!.sharedTokens >= 3);
  assert.strictEqual(c!.passed, true);
  assert.ok(c!.decisionReason === "CONFIRMED");
}

function testDedupeTopCandidates() {
  const chapterVerses = [
    { ref: "1:1", textPlain: "דבר אחד", verseNum: 1 },
    { ref: "1:2", textPlain: "דבר אחד", verseNum: 2 },
    { ref: "1:3", textPlain: "דבר אחד", verseNum: 3 },
  ];
  const { debug } = resolveVerseFromChapter(
    "דבר אחד",
    chapterVerses,
    "Genesis",
    1,
    undefined,
    { collectDebug: true }
  );
  const verseNums = (debug?.candidates || []).map((c) => c.verseNum);
  const unique = new Set(verseNums);
  assert.strictEqual(verseNums.length, unique.size, "top candidates must have no duplicate verse numbers");
}

function testExtractQuoteWindowAfterMarker() {
  const text = "שנאמר (יחזקאל כג) ונוסרו כל הנשים";
  const markerStart = text.indexOf("(יחזקאל");
  const markerEnd = text.indexOf(")") + 1;
  const window = extractQuoteWindow(text, markerStart, markerEnd);
  assert.ok(window.includes("ונוסרו"));
}

function testExtractQuoteWindowBoilerplateReturnsEmpty() {
  const text = "(שם כח) עד שגומר כל הפרשה";
  const markerStart = text.indexOf("(שם");
  const markerEnd = text.indexOf(")") + 1;
  const window = extractQuoteWindow(text, markerStart, markerEnd);
  assert.strictEqual(window, "", "boilerplate-only after marker should return empty");
}

function testNeverConfirmOnOneSharedToken() {
  const chapterVerses = [
    { ref: "1:1", textPlain: "מילה אחת בלבד", verseNum: 1 },
  ];
  const { resolved } = resolveVerseFromChapter(
    "מילה",
    chapterVerses,
    "Genesis",
    1,
    undefined
  );
  assert.strictEqual(resolved.length, 0);
}

function run() {
  testNormalizeHebrewRemovesNiqqud();
  testNormalizeHebrewRemovesHtmlEntities();
  testNormalizeHebrewRemovesBracketVariants();
  testScoreThresholdMustConfirm();
  testDedupeTopCandidates();
  testExtractQuoteWindowAfterMarker();
  testExtractQuoteWindowBoilerplateReturnsEmpty();
  testNeverConfirmOnOneSharedToken();
  // eslint-disable-next-line no-console
  console.log("reflinkVerseResolve tests passed");
}

run();
