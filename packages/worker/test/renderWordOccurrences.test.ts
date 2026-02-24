import assert from "assert";
import { renderWordOccurrencesPretty } from "../src/planner/renderers/renderWordOccurrences";

const baseResult = {
  kind: "OK",
  plan: { intent: "WORD_OCCURRENCES", scope: { node: { type: "SUBCORPUS", name: "נביאים" } } } as any,
  rows: [
    { ref: "ישעיה 11:8", text: "בֵּ֖ית יַעֲקֹ֑ב לְכ֥וּ וְנֵלְכָ֖ה בְּא֥וֹר יְהֹוָֽה׃" },
    { ref: "שופטים 5:3", text: "שִׁמְעוּ מְלָכִים&nbsp;הַאֲזִ֣ינוּ רֹזְנִ֔ים" },
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
  assert.ok(out.includes("שופטים ה:ג"), "single digits no geresh");
  assert.ok(out.includes("ישעיה י״א:ח"), "double digits keep gershayim");
}

function testSanitizeNbsp() {
  const out = renderWordOccurrencesPretty(baseResult, { term: "אור", limit: 20, offset: 0 });
  assert.ok(!out.includes("&nbsp;"), "should strip &nbsp;");
}

function testNoClipByDefault() {
  const longResult = {
    ...baseResult,
    rows: [{ ref: "ישעיה 11:8", text: "א".repeat(300) }],
  };
  const out = renderWordOccurrencesPretty(longResult as any, { term: "אור", limit: 1, offset: 0 });
  assert.ok(!out.includes("…"), "should not clip by default");
}

function run() {
  testHeadline();
  testNoCitationsTail();
  testHebrewNumerals();
  testSanitizeNbsp();
  testNoClipByDefault();
  // eslint-disable-next-line no-console
  console.log("renderWordOccurrences tests passed");
}

run();
