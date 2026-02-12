import assert from "assert";
import { renderWordOccurrencesPretty } from "../src/planner/renderers/renderWordOccurrences";

const baseResult = {
  kind: "OK",
  plan: { intent: "WORD_OCCURRENCES", scope: { node: { type: "SUBCORPUS", name: "נביאים" } } } as any,
  rows: [
    { ref: "ישעיה 11:8", text: "בֵּ֖ית יַעֲקֹ֑ב לְכ֥וּ וְנֵלְכָ֖ה בְּא֥וֹר יְהֹוָֽה׃" },
    { ref: "שופטים 5:23", text: "א֣וֹרוּ מֵר֗וֹז ... &nbsp;כִּ֤י לֹֽא־בָ֙אוּ֙" },
  ],
  totals: { scanned: 150, withCandidates: 2, confirmed: 0, unconfirmed: 0, limited: true },
} as any;

function testHeadline() {
  const out = renderWordOccurrencesPretty(baseResult, { term: "אור", limit: 20, offset: 0 });
  assert.ok(out.includes("נמצאו 150 מקורות בנביאים שבהם מופיעה המילה ‘אור’. הנה 20 מהם:"), "headline should include total and limit");
}

function testNoCitationsTail() {
  const out = renderWordOccurrencesPretty(baseResult, { term: "אור", limit: 20, offset: 0 });
  assert.ok(!out.includes("ציטוטים"), "should not include citations tail");
}

function testHebrewNumerals() {
  const out = renderWordOccurrencesPretty(baseResult, { term: "אור", limit: 20, offset: 0 });
  assert.ok(out.includes("ישעיה י״א:ח"), "ref should be in Hebrew numerals");
}

function testSanitizeNbsp() {
  const out = renderWordOccurrencesPretty(baseResult, { term: "אור", limit: 20, offset: 0 });
  assert.ok(!out.includes("&nbsp;"), "should strip &nbsp;");
}

function testClipMarker() {
  const longResult = {
    ...baseResult,
    rows: [{ ref: "ישעיה 11:8", text: "א".repeat(300) }],
  };
  const out = renderWordOccurrencesPretty(longResult as any, { term: "אור", limit: 1, offset: 0 });
  assert.ok(out.includes("מקוצר"), "clipped text should be marked");
}

function run() {
  testHeadline();
  testNoCitationsTail();
  testHebrewNumerals();
  testSanitizeNbsp();
  testClipMarker();
  // eslint-disable-next-line no-console
  console.log("renderWordOccurrences tests passed");
}

run();
