import assert from "assert";
import { normalizeQueryInput } from "../src/cli/utils/normalizeQuery";

function testSmartQuotes() {
  const out = normalizeQueryInput('איפה מופיעה המילה ״אור״ בנביאים');
  assert.strictEqual(out, 'איפה מופיעה המילה "אור" בנביאים');
}

function testUnmatchedTrailing() {
  const out = normalizeQueryInput('שאלה כלשהי "');
  assert.strictEqual(out, "שאלה כלשהי");
}

function testNewlinesCollapse() {
  const out = normalizeQueryInput("שורה ראשונה\nשורה שניה");
  assert.strictEqual(out, "שורה ראשונה שורה שניה");
}

function run() {
  testSmartQuotes();
  testUnmatchedTrailing();
  testNewlinesCollapse();
  // eslint-disable-next-line no-console
  console.log("normalizeQuery tests passed");
}

run();
