/**
 * Tests for extractTurnSummary: builds a compact TurnSummary from a completed plan + result.
 */
import assert from "assert";
import { extractTurnSummary } from "../src/conversation/turnSummary";
import { QueryIntent } from "../src/queryPlanner";
import type { QueryPlan, PlanResult } from "../src/planner/types";

const basePlan = (overrides: Partial<QueryPlan> = {}): QueryPlan => ({
  intent: QueryIntent.GENERAL_QA,
  scope: {},
  strategy: "VECTOR_ONLY",
  limits: { maxResults: 8, maxSegmentsForSynthesis: 0 },
  debug: { matchedRule: "LLM_ROUTER" },
  ...overrides,
});

const okResult = (overrides: Partial<Extract<PlanResult, { kind: "OK" }>> = {}): PlanResult => ({
  kind: "OK",
  answer: "",
  rows: [],
  citations: [],
  plan: basePlan(),
  ...overrides,
});

// --- intent ---

function testIntentCopiedFromPlan() {
  const plan = basePlan({ intent: QueryIntent.EXACT_REF });
  const summary = extractTurnSummary("בראשית א:א", plan, okResult(), "תשובה", undefined);
  assert.strictEqual(summary.intent, "EXACT_REF");
}

function testUserQueryStoredVerbatim() {
  const plan = basePlan();
  const summary = extractTurnSummary("שאלה כלשהי", plan, okResult(), "תשובה", undefined);
  assert.strictEqual(summary.userQuery, "שאלה כלשהי");
}

// --- lastRefs ---

function testExactRefPlanExtractsRefFromPlanRef() {
  const plan = basePlan({
    intent: QueryIntent.EXACT_REF,
    ref: { raw: "בראשית א:א", normalizedRef: "Genesis 1:1", work: "Genesis", chapter: 1, verse: 1 },
  });
  const summary = extractTurnSummary("בראשית א:א", plan, okResult(), "טקסט");
  assert.strictEqual(summary.lastRefs.length, 1);
  assert.strictEqual(summary.lastRefs[0].work, "Genesis");
  assert.strictEqual(summary.lastRefs[0].normalizedRef, "Genesis 1:1");
}

function testChapterAboutPlanExtractsRefFromScope() {
  const plan = basePlan({
    intent: QueryIntent.CHAPTER_ABOUT,
    scope: { work: "Berakhot", chapter: 3 },
  });
  const summary = extractTurnSummary("על מה מדבר פרק ג בברכות", plan, okResult(), "טקסט");
  assert.strictEqual(summary.lastRefs.length, 1);
  assert.strictEqual(summary.lastRefs[0].work, "Berakhot");
  assert.ok(summary.lastRefs[0].normalizedRef.includes("3"), "Ref should include chapter number");
}

function testGeneralQAWithNoPlanRefYieldsEmptyRefs() {
  const plan = basePlan({ intent: QueryIntent.GENERAL_QA });
  const summary = extractTurnSummary("מה ההבדל בין משנה לגמרא", plan, okResult(), "תשובה");
  assert.deepStrictEqual(summary.lastRefs, []);
}

function testWordOccurrencesYieldsEmptyRefs() {
  // Word occurrence results don't represent a specific located ref
  const plan = basePlan({ intent: QueryIntent.WORD_OCCURRENCES, term: "אור" });
  const summary = extractTurnSummary("איפה מופיע אור", plan, okResult(), "תשובה");
  assert.deepStrictEqual(summary.lastRefs, []);
}

// --- answerSnippet ---

function testAnswerSnippetTruncatedAt120Chars() {
  const longAnswer = "א".repeat(200);
  const plan = basePlan();
  const summary = extractTurnSummary("שאלה", plan, okResult(), longAnswer);
  assert.ok(summary.answerSnippet.length <= 120, "Snippet should be at most 120 chars");
  assert.ok(summary.answerSnippet.startsWith("א"), "Snippet should start with answer content");
}

function testAnswerSnippetKeptFullWhenShort() {
  const shortAnswer = "תשובה קצרה";
  const plan = basePlan();
  const summary = extractTurnSummary("שאלה", plan, okResult(), shortAnswer);
  assert.strictEqual(summary.answerSnippet, shortAnswer);
}

// --- rewrittenQuery ---

function testRewrittenQueryStoredWhenProvided() {
  const plan = basePlan({ intent: QueryIntent.EXACT_REF });
  const summary = extractTurnSummary("ועוד", plan, okResult(), "טקסט", "תן לי את בראשית א:ב");
  assert.strictEqual(summary.rewrittenQuery, "תן לי את בראשית א:ב");
}

function testRewrittenQueryUndefinedWhenNotProvided() {
  const plan = basePlan();
  const summary = extractTurnSummary("שאלה עצמאית", plan, okResult(), "טקסט", undefined);
  assert.strictEqual(summary.rewrittenQuery, undefined);
}

// --- disambiguationPending ---

function testDisambiguationPendingSetWhenPlanHasIt() {
  const plan = basePlan({
    intent: QueryIntent.QUOTE_ENTITY,
    term: "רבי עקיבא",
    disambiguation: { required: true, reason: "באיזו מסכת?", suggestions: ["ברכות", "סוטה"] },
  });
  const result: PlanResult = { kind: "DISAMBIGUATION_REQUIRED", message: "באיזו מסכת?", suggestions: ["ברכות", "סוטה"] };
  const summary = extractTurnSummary("משניות שמזכירות רבי עקיבא", plan, result, "באיזו מסכת?", "משניות שמזכירות רבי עקיבא");
  assert.ok(summary.disambiguationPending != null);
  assert.strictEqual(summary.disambiguationPending!.question, "באיזו מסכת?");
  assert.deepStrictEqual(summary.disambiguationPending!.suggestions, ["ברכות", "סוטה"]);
  // originalQuery should be the standalone query sent to the planner
  assert.strictEqual(summary.disambiguationPending!.originalQuery, "משניות שמזכירות רבי עקיבא");
}

function testDisambiguationPendingUsesRewrittenQueryAsOriginalWhenPresent() {
  // If the query was rewritten before planning, originalQuery should be the rewritten version
  const plan = basePlan({
    intent: QueryIntent.QUOTE_ENTITY,
    disambiguation: { required: true, reason: "באיזו מסכת?", suggestions: ["ברכות"] },
  });
  const result: PlanResult = { kind: "DISAMBIGUATION_REQUIRED", message: "באיזו מסכת?", suggestions: ["ברכות"] };
  const summary = extractTurnSummary(
    "ועוד רבי עקיבא",            // original user input
    plan,
    result,
    "באיזו מסכת?",
    "באילו משניות מופיע רבי עקיבא" // rewritten query — this is what went into the planner
  );
  assert.strictEqual(summary.disambiguationPending!.originalQuery, "באילו משניות מופיע רבי עקיבא");
}

function testDisambiguationPendingUndefinedForNormalResult() {
  const plan = basePlan({ intent: QueryIntent.EXACT_REF });
  const summary = extractTurnSummary("בראשית א:א", plan, okResult(), "טקסט");
  assert.strictEqual(summary.disambiguationPending, undefined);
}

function run() {
  testIntentCopiedFromPlan();
  testUserQueryStoredVerbatim();
  testExactRefPlanExtractsRefFromPlanRef();
  testChapterAboutPlanExtractsRefFromScope();
  testGeneralQAWithNoPlanRefYieldsEmptyRefs();
  testWordOccurrencesYieldsEmptyRefs();
  testAnswerSnippetTruncatedAt120Chars();
  testAnswerSnippetKeptFullWhenShort();
  testRewrittenQueryStoredWhenProvided();
  testRewrittenQueryUndefinedWhenNotProvided();
  testDisambiguationPendingSetWhenPlanHasIt();
  testDisambiguationPendingUsesRewrittenQueryAsOriginalWhenPresent();
  testDisambiguationPendingUndefinedForNormalResult();
  console.log("extractTurnSummary tests passed");
}

run();
