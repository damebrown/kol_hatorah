import assert from "assert";
import { QueryIntent, ScopeNodeType, planQuery, expandHebrewPrefixes, getWorkInForNode, WorkRegistry } from "../src/queryPlanner";

const makeRegistry = (data: Record<string, string[]>): WorkRegistry => {
  const reg: WorkRegistry = new Map();
  Object.entries(data).forEach(([type, works]) => {
    reg.set(type, new Set(works));
  });
  return reg;
};

const registry = makeRegistry({
  tanakh: ["Genesis", "Exodus", "Isaiah", "Ezekiel", "Psalms"],
  mishnah: ["Berakhot", "Peah", "Yevamot"],
  bavli: ["Berakhot", "Shabbat"],
});

async function testExactRef() {
  const plan = await planQuery("בראשית 1:1", registry);
  assert.strictEqual(plan.intent, QueryIntent.EXACT_REF);
  assert.strictEqual(plan.ref?.normalizedRef, "Genesis 1:1");
}

async function testWordOccurrences() {
  const plan = await planQuery('איפה מופיעה המילה "אור" בנביאים', registry);
  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.scope.node?.type, ScopeNodeType.SUBCORPUS);
}

async function testWordOccurrencesSingleQuotes() {
  const plan = await planQuery("איפה מופיעה המילה 'אור' בנביאים", registry);
  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
}

async function testWordOccurrencesSmartQuotes() {
  const plan = await planQuery('איפה מופיעה המילה ״אור״ בנביאים', registry);
  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
}

async function testChapterAbout() {
  const plan = await planQuery("על מה מדבר פרק 3 בברכות", registry);
  assert.strictEqual(plan.intent, QueryIntent.CHAPTER_ABOUT);
  assert.strictEqual(plan.scope.work, "Berakhot");
}

async function testDisambiguation() {
  const plan = await planQuery("איפה מופיעה המילה אור בפרק 3", registry);
  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.ok(plan.disambiguation?.required);
}

async function testListWorksMishnah() {
  const plan = await planQuery("תן לי את כל המסכתות במשנה שמזכירות את רבי עקיבא", registry);
  assert.strictEqual(plan.intent, QueryIntent.LIST_WORKS_MENTIONING_ENTITY);
  assert.strictEqual(plan.strategy, "SQL_ONLY");
  assert.strictEqual(plan.aggregateWorks, true);
}

async function testListWorksDisambiguation() {
  const plan = await planQuery("איזה מסכתות מזכירות רבי עקיבא", registry);
  assert.strictEqual(plan.intent, QueryIntent.LIST_WORKS_MENTIONING_ENTITY);
  assert.ok(plan.disambiguation?.required);
}

function testScopeExpansion() {
  const works = getWorkInForNode({ type: ScopeNodeType.SUBCORPUS, name: "נביאים" }, registry) || [];
  assert.ok(works.includes("Isaiah"));
  assert.ok(!works.includes("Genesis"));

  const sederWorks = getWorkInForNode({ type: ScopeNodeType.SUBCORPUS, name: "זרעים" }, registry) || [];
  assert.ok(sederWorks.includes("Berakhot"));
  assert.ok(!sederWorks.includes("Yevamot")); // from Nashim
}

function testPrefixExpansion() {
  const variants = expandHebrewPrefixes("אור");
  assert.ok(variants.includes("אור"));
  assert.ok(variants.includes("ואור"));
  assert.ok(variants.includes("באור"));
  assert.strictEqual(new Set(variants).size, variants.length);
}

async function run() {
  await testExactRef();
  await testWordOccurrences();
  await testWordOccurrencesSingleQuotes();
  await testWordOccurrencesSmartQuotes();
  await testChapterAbout();
  await testDisambiguation();
  await testListWorksMishnah();
  await testListWorksDisambiguation();
  testScopeExpansion();
  testPrefixExpansion();
  // eslint-disable-next-line no-console
  console.log("queryPlanner tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
