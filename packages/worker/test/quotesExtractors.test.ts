import assert from "assert";
import { IntroWordExtractor } from "../src/quotes/extractors/IntroWordExtractor";
import { QuotationMarksExtractor } from "../src/quotes/extractors/QuotationMarksExtractor";

const intro = new IntroWordExtractor();
const quotes = new QuotationMarksExtractor();

function testIntroExtractor() {
  const text = 'אמר רבי עקיבא שנאמר "ואהבת לרעך כמוך" דבר אחר';
  const cands = intro.extract(text);
  assert.ok(cands.length >= 1, "should find intro-based quote");
  assert.ok(cands[0].quoteTextRaw.includes("ואהבת"));
}

function testIntroStopsAtPunctuation() {
  const text = "שנאמר ואהבת לרעך כמוך. מיד אחר כך";
  const cands = intro.extract(text);
  assert.ok(cands.length === 1);
  assert.ok(!cands[0].quoteTextRaw.includes("מיד"));
}

function testQuotesExtractor() {
  const text = 'אמרו "בראשית ברא אלהים" וזה סימן';
  const cands = quotes.extract(text);
  assert.ok(cands.length === 1);
  assert.strictEqual(cands[0].quoteTextRaw, "בראשית ברא אלהים");
}

function run() {
  testIntroExtractor();
  testIntroStopsAtPunctuation();
  testQuotesExtractor();
  // eslint-disable-next-line no-console
  console.log("quotesExtractors tests passed");
}

run();
