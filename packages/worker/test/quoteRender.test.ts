import assert from "assert";
import { renderQuoteResultsPretty } from "../src/quotes/renderQuoteResults";

const sampleResult = {
  kind: "OK",
  answer: "מקורות שמכילים ציטוטים מהתנ\"ך",
  rows: [
    {
      ref: "סוטה א:א",
      text: "שנאמר ואהבת לרעך כמוך",
      quoteCandidates: [
        {
          status: "CONFIRMED",
          candidate: { quoteTextRaw: "ואהבת לרעך כמוך", signal: "שנאמר" },
          matches: [{ tanakhRef: "Leviticus 19:18", score: 0.82, tanakhText: "ואהבת לרעך כמוך" }],
        },
      ],
    },
    {
      ref: "סוטה ג:ד",
      text: "אמר וכו",
      quoteCandidates: [
        {
          status: "UNCONFIRMED",
          candidate: { quoteTextRaw: "אמר קרא פלוני", signal: "שנאמר" },
          matches: [],
        },
      ],
    },
  ],
  totals: { scanned: 2, withCandidates: 2, confirmed: 1, unconfirmed: 1 },
  plan: {} as any,
} as const;

function testNoFluff() {
  const out = renderQuoteResultsPretty(sampleResult as any);
  assert.ok(!out.includes("אני כאן"), "should not include fluff");
}

function testSections() {
  const out = renderQuoteResultsPretty(sampleResult as any);
  assert.ok(out.includes("✅"), "should include confirmed section");
  assert.ok(out.includes("⚠️"), "should include unconfirmed section");
}

function testNoTanakhInUnconfirmed() {
  const out = renderQuoteResultsPretty(sampleResult as any);
  const lines = out.split("\n").filter((l) => l.includes("סוטה ג:ד"));
  assert.ok(lines.every((l) => !l.includes("שויך ל")), "unconfirmed should not claim tanakh ref");
}

function run() {
  testNoFluff();
  testSections();
  testNoTanakhInUnconfirmed();
  // eslint-disable-next-line no-console
  console.log("quoteRender tests passed");
}

run();
