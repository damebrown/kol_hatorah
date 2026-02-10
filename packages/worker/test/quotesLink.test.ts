import assert from "assert";
import { getSQLiteManager } from "../src/storage/sqlite";
import { linkToTanakh } from "../src/quotes/linkToTanakh";
import { QuoteCandidate } from "../src/quotes/types/QuoteCandidate";
import { QuoteMethod } from "../src/quotes/types/QuoteMethod";

async function setupDb() {
  const sqlite = await getSQLiteManager(":memory:");
  sqlite.insertSegments([
    {
      id: "tanakh-1",
      type: "tanakh",
      work: "Genesis",
      ref: "Genesis 1:3",
      normalizedRef: "Genesis 1:3",
      lang: "he",
      source: "test",
      text: "ויאמר אלהים יהי אור ויהי אור",
    } as any,
  ]);
  return sqlite;
}

async function testConfirmed() {
  const sqlite = await setupDb();
  try {
    const cand: QuoteCandidate = {
      method: QuoteMethod.INTRO_WORD,
      startIdx: 0,
      endIdx: 0,
      quoteTextRaw: "ויאמר אלהים יהי אור",
      quoteTextNormalized: "ויאמר אלהים יהי אור",
      signal: "שנאמר",
      confidenceHint: "HIGH",
    };
    const links = linkToTanakh(cand, { topK: 3 }, sqlite);
    assert.ok(links.length >= 1, "expected a confirmed link");
  } finally {
    sqlite.close();
  }
}

async function testUnconfirmed() {
  const sqlite = await setupDb();
  try {
    const cand: QuoteCandidate = {
      method: QuoteMethod.INTRO_WORD,
      startIdx: 0,
      endIdx: 0,
      quoteTextRaw: "טקסט לא תנכי בעליל",
      quoteTextNormalized: "טקסט לא תנכי בעליל",
      signal: "שנאמר",
      confidenceHint: "HIGH",
    };
    const links = linkToTanakh(cand, { topK: 3 }, sqlite);
    assert.strictEqual(links.length, 0);
  } finally {
    sqlite.close();
  }
}

async function run() {
  await testConfirmed();
  await testUnconfirmed();
  // eslint-disable-next-line no-console
  console.log("quotesLink tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
