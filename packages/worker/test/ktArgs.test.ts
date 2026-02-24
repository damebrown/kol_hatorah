import assert from "assert";
import { parseAskArgs } from "../src/cli/utils/parseAskArgs";
import { normalizeQueryInput } from "../src/cli/utils/normalizeQuery";

function testSplitTokensJoin() {
  const argv = ["ask", "איפה", "מופיעה", "המילה", '"אור"', "בנביאים"];
  const { queryRaw } = parseAskArgs(argv.slice(1));
  const norm = normalizeQueryInput(queryRaw);
  assert.strictEqual(norm, 'איפה מופיעה המילה "אור" בנביאים');
}

function testFlagsSeparated() {
  const argv = ["ask", "--json", "איפה", "מופיע", "אור"];
  const { queryRaw, flags } = parseAskArgs(argv.slice(1));
  assert.strictEqual(flags.includes("--json"), true);
  const norm = normalizeQueryInput(queryRaw);
  assert.strictEqual(norm, "איפה מופיע אור");
}

function run() {
  testSplitTokensJoin();
  testFlagsSeparated();
  // eslint-disable-next-line no-console
  console.log("ktArgs tests passed");
}

run();
