/**
 * Tests for LLM-based intent router.
 * No external API calls - all use mocked callLLM.
 */
import assert from "assert";
import { QueryIntent, ScopeNodeType, planQueryWithLLMRouter, WorkRegistry } from "../src/queryPlanner";

const makeRegistry = (data: Record<string, string[]>): WorkRegistry => {
  const reg: WorkRegistry = new Map();
  Object.entries(data).forEach(([type, works]) => reg.set(type, new Set(works)));
  return reg;
};

const registry = makeRegistry({
  tanakh: ["Genesis", "Exodus", "Isaiah", "Ezekiel", "Psalms"],
  mishnah: ["Berakhot", "Peah", "Yevamot", "Sotah"],
  bavli: ["Berakhot", "Shabbat"],
});

async function testValidJsonHighConfidence() {
  const mockJson = JSON.stringify({
    intent: "WORD_OCCURRENCES",
    confidence: 0.9,
    term: "אור",
    scope: { rawCorpus: null, rawSubcorpus: "נביאים", rawWork: null, chapter: null, verse: null },
    ref: null,
    targetTypes: null,
    needsDisambiguation: false,
    disambiguationQuestion: null,
    disambiguationSuggestions: null,
  });

  const plan = await planQueryWithLLMRouter("איפה בנביאים מופיעה המילה אור", registry, {
    enableLLM: true,
    callLLM: async () => mockJson,
  });

  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
  assert.strictEqual(plan.scope.node?.type, ScopeNodeType.SUBCORPUS);
  assert.strictEqual(plan.scope.node?.name, "נביאים");
  assert.strictEqual(plan.debug.matchedRule, "LLM_ROUTER");
  assert.ok(plan.debug.notes?.includes(mockJson));
}

async function testLowConfidenceFallback() {
  const mockJson = JSON.stringify({
    intent: "WORD_OCCURRENCES",
    confidence: 0.5,
    term: "אור",
    scope: { rawCorpus: null, rawSubcorpus: "נביאים", rawWork: null, chapter: null, verse: null },
    ref: null,
    targetTypes: null,
    needsDisambiguation: false,
    disambiguationQuestion: null,
    disambiguationSuggestions: null,
  });

  const plan = await planQueryWithLLMRouter("איפה בנביאים מופיעה המילה אור", registry, {
    enableLLM: true,
    callLLM: async () => mockJson,
  });

  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
  assert.strictEqual(plan.debug.matchedRule, "WORD_OCCURRENCES");
}

async function testInvalidJsonFallback() {
  const plan = await planQueryWithLLMRouter("איפה בנביאים מופיעה המילה אור", registry, {
    enableLLM: true,
    callLLM: async () => "not valid json {{{",
  });

  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
  assert.notStrictEqual(plan.debug.matchedRule, "LLM_ROUTER");
}

async function testNeedsDisambiguation() {
  const mockJson = JSON.stringify({
    intent: "QUOTE_ENTITY",
    confidence: 0.9,
    term: "רבי עקיבא",
    scope: { rawCorpus: "משנה", rawSubcorpus: null, rawWork: null, chapter: null, verse: null },
    ref: null,
    targetTypes: null,
    needsDisambiguation: true,
    disambiguationQuestion: "איזו מסכת?",
    disambiguationSuggestions: ["מסכת סוטה", "מסכת ברכות"],
  });

  const plan = await planQueryWithLLMRouter("משניות שמזכירות רבי עקיבא", registry, {
    enableLLM: true,
    callLLM: async () => mockJson,
  });

  assert.strictEqual(plan.intent, QueryIntent.QUOTE_ENTITY);
  assert.strictEqual(plan.term, "רבי עקיבא");
  assert.ok(plan.disambiguation?.required);
  assert.strictEqual(plan.disambiguation.reason, "איזו מסכת?");
  assert.deepStrictEqual(plan.disambiguation.suggestions, ["מסכת סוטה", "מסכת ברכות"]);
  assert.strictEqual(plan.debug.matchedRule, "LLM_ROUTER");
}

async function testIntegrationWordOrder() {
  const mockJson = JSON.stringify({
    intent: "WORD_OCCURRENCES",
    confidence: 0.95,
    term: "אור",
    scope: { rawCorpus: null, rawSubcorpus: "נביאים", rawWork: null, chapter: null, verse: null },
    ref: null,
    targetTypes: null,
    needsDisambiguation: false,
    disambiguationQuestion: null,
    disambiguationSuggestions: null,
  });

  const plan = await planQueryWithLLMRouter("איפה בנביאים מופיעה המילה אור", registry, {
    enableLLM: true,
    callLLM: async () => mockJson,
  });

  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
  assert.strictEqual(plan.debug.matchedRule, "LLM_ROUTER");
}

async function testEnableLLMFalse() {
  const plan = await planQueryWithLLMRouter("איפה בנביאים מופיעה המילה אור", registry, {
    enableLLM: false,
  });

  assert.strictEqual(plan.intent, QueryIntent.WORD_OCCURRENCES);
  assert.strictEqual(plan.term, "אור");
  assert.notStrictEqual(plan.debug.matchedRule, "LLM_ROUTER");
}

async function testGetChapterTextMapsToExactRef() {
  const mockJson = JSON.stringify({
    intent: "GET_CHAPTER_TEXT",
    confidence: 0.95,
    term: null,
    scope: { rawCorpus: "משנה", rawSubcorpus: null, rawWork: "סוטה", chapter: 7, verse: null },
    ref: null,
    targetTypes: null,
    needsDisambiguation: false,
    disambiguationQuestion: null,
    disambiguationSuggestions: null,
  });

  const plan = await planQueryWithLLMRouter("תן לי את פרק ז במשנה במסכת סוטה", registry, {
    enableLLM: true,
    callLLM: async () => mockJson,
  });

  assert.strictEqual(plan.intent, QueryIntent.EXACT_REF);
  assert.strictEqual(plan.scope.work, "Sotah");
  assert.strictEqual(plan.scope.chapter, 7);
  assert.ok(plan.ref?.normalizedRef?.includes("7:"));
  assert.strictEqual(plan.strategy, "SQL_ONLY");
}

async function run() {
  await testValidJsonHighConfidence();
  await testLowConfidenceFallback();
  await testInvalidJsonFallback();
  await testNeedsDisambiguation();
  await testIntegrationWordOrder();
  await testEnableLLMFalse();
  await testGetChapterTextMapsToExactRef();
  console.log("llmRouter tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
