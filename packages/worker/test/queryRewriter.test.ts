/**
 * Tests for resolveQuery: handles disambiguation bypass and LLM rewriting.
 * All LLM calls are mocked via opts.callLLM — no external API calls.
 */
import assert from "assert";
import { resolveQuery } from "../src/conversation/queryRewriter";
import { TurnSummary } from "../src/conversation/types";

const makeTurn = (overrides: Partial<TurnSummary> = {}): TurnSummary => ({
  userQuery: "מה בראשית א:א?",
  intent: "EXACT_REF",
  lastRefs: [{ work: "Genesis", normalizedRef: "Genesis 1:1" }],
  answerSnippet: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם",
  ...overrides,
});

// --- No prior turns ---

async function testNoPriorTurnsReturnsOriginalWithoutCallingLLM() {
  let llmCalled = false;
  const result = await resolveQuery("שאלה חדשה", [], {
    callLLM: async () => { llmCalled = true; return "שאלה חדשה"; },
  });
  assert.strictEqual(result, "שאלה חדשה");
  assert.strictEqual(llmCalled, false, "LLM must not be called when there are no prior turns");
}

// --- Disambiguation bypass ---

async function testDisambiguationBypassSkipsLLM() {
  let llmCalled = false;
  const priorTurns: TurnSummary[] = [
    makeTurn({
      disambiguationPending: {
        question: "באיזו מסכת?",
        suggestions: ["ברכות", "סוטה"],
        originalQuery: "באילו משניות מופיע רבי עקיבא",
      },
    }),
  ];
  const result = await resolveQuery("ברכות", priorTurns, {
    callLLM: async () => { llmCalled = true; return "should not reach here"; },
  });
  assert.strictEqual(llmCalled, false, "LLM must not be called when disambiguation is pending");
  assert.strictEqual(result, "באילו משניות מופיע רבי עקיבא בברכות");
}

async function testDisambiguationUsesOriginalQueryField() {
  // Ensure the reconstruction uses disambiguationPending.originalQuery, not userQuery
  const priorTurns: TurnSummary[] = [
    makeTurn({
      userQuery: "this was already rewritten into something else",
      disambiguationPending: {
        question: "באיזו מסכת?",
        suggestions: ["ברכות", "סוטה"],
        originalQuery: "אילו פסוקים מצוטטים",
      },
    }),
  ];
  const result = await resolveQuery("סוטה", priorTurns);
  assert.strictEqual(result, "אילו פסוקים מצוטטים בסוטה");
}

async function testDisambiguationOnlyTriggersFromLastTurn() {
  // If disambiguation is in an older turn (not the last), it should NOT trigger the bypass
  let llmCalled = false;
  const priorTurns: TurnSummary[] = [
    makeTurn({
      disambiguationPending: {
        question: "באיזו מסכת?",
        suggestions: ["ברכות", "סוטה"],
        originalQuery: "שאלה ישנה",
      },
    }),
    // Last turn has no disambiguation — user already answered it
    makeTurn({ disambiguationPending: undefined }),
  ];
  await resolveQuery("ועוד?", priorTurns, {
    callLLM: async (p) => { llmCalled = true; return "שאלה מחדש"; },
  });
  assert.strictEqual(llmCalled, true, "LLM should be called when last turn has no pending disambiguation");
}

// --- Normal rewriting ---

async function testRewriterCalledWithContextForNormalFollowUp() {
  let capturedPrompt = "";
  const priorTurns = [makeTurn()];
  const result = await resolveQuery("ועוד?", priorTurns, {
    callLLM: async (p) => {
      capturedPrompt = p;
      return "תן לי עוד פסוקים מבראשית א";
    },
  });
  assert.strictEqual(result, "תן לי עוד פסוקים מבראשית א");
  assert.ok(capturedPrompt.includes("ועוד?"), "Prompt should include the current query");
  assert.ok(capturedPrompt.includes("Genesis 1:1") || capturedPrompt.includes("בראשית"), "Prompt should include prior ref context");
}

async function testRewriterReturnsOriginalWhenLLMReturnsSameString() {
  const priorTurns = [makeTurn()];
  const result = await resolveQuery("מה הפסוק הבא?", priorTurns, {
    callLLM: async () => "מה הפסוק הבא?",
  });
  assert.strictEqual(result, "מה הפסוק הבא?");
}

// --- Fail-open behavior ---

async function testFailOpenOnLLMThrow() {
  const priorTurns = [makeTurn()];
  const result = await resolveQuery("ועוד?", priorTurns, {
    callLLM: async () => { throw new Error("OpenAI API error"); },
  });
  assert.strictEqual(result, "ועוד?", "Should return original query when LLM throws");
}

async function testFailOpenOnEmptyLLMResponse() {
  const priorTurns = [makeTurn()];
  const result = await resolveQuery("ועוד?", priorTurns, {
    callLLM: async () => "",
  });
  assert.strictEqual(result, "ועוד?", "Should return original query when LLM returns empty string");
}

async function testFailOpenOnWhitespaceOnlyLLMResponse() {
  const priorTurns = [makeTurn()];
  const result = await resolveQuery("ועוד?", priorTurns, {
    callLLM: async () => "   \n  ",
  });
  assert.strictEqual(result, "ועוד?", "Should return original query when LLM returns whitespace only");
}

async function run() {
  await testNoPriorTurnsReturnsOriginalWithoutCallingLLM();
  await testDisambiguationBypassSkipsLLM();
  await testDisambiguationUsesOriginalQueryField();
  await testDisambiguationOnlyTriggersFromLastTurn();
  await testRewriterCalledWithContextForNormalFollowUp();
  await testRewriterReturnsOriginalWhenLLMReturnsSameString();
  await testFailOpenOnLLMThrow();
  await testFailOpenOnEmptyLLMResponse();
  await testFailOpenOnWhitespaceOnlyLLMResponse();
  console.log("queryRewriter tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
