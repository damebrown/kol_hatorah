import assert from "assert";
import { planQuery, WorkRegistry, QueryIntent } from "../src/queryPlanner";
import { ScopeNodeType } from "../src/planner/types";

const makeRegistry = (data: Record<string, string[]>): WorkRegistry => {
  const reg: WorkRegistry = new Map();
  Object.entries(data).forEach(([type, works]) => reg.set(type, new Set(works)));
  return reg;
};

const registry = makeRegistry({
  mishnah: ["Sotah", "Berakhot"],
});

async function testQuoteIntent() {
  const plan = await planQuery('תן לי את כל המשניות במסכת סוטה שמצטטים פסוק מהתנ"ת', registry);
  assert.strictEqual(plan.intent, QueryIntent.CORPUS_QUOTE_QUERY);
  assert.strictEqual(plan.scope.work, "Sotah");
}

async function testQuoteDisambiguation() {
  const plan = await planQuery("אילו משניות מצטטים פסוק מהתנ\"ך", registry);
  assert.strictEqual(plan.intent, QueryIntent.CORPUS_QUOTE_QUERY);
  assert.ok(plan.disambiguation?.required);
}

async function run() {
  await testQuoteIntent();
  await testQuoteDisambiguation();
  // eslint-disable-next-line no-console
  console.log("quotesIntent tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
