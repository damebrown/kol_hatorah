/**
 * Tests for ThreadStore: in-session conversation thread management.
 */
import assert from "assert";
import { ThreadStore } from "../src/conversation/threadStore";
import { TurnSummary } from "../src/conversation/types";
import { CONVERSATION_MAX_TURNS } from "../src/config/constants";

const makeTurn = (q: string, overrides: Partial<TurnSummary> = {}): TurnSummary => ({
  userQuery: q,
  intent: "GENERAL_QA",
  lastRefs: [],
  answerSnippet: "תשובה לדוגמה",
  ...overrides,
});

function testCreateReturnsNonEmptyUniqueIds() {
  const store = new ThreadStore();
  const id1 = store.createThread();
  const id2 = store.createThread();
  assert.ok(id1.length > 0, "Thread ID should be non-empty");
  assert.ok(id2.length > 0, "Thread ID should be non-empty");
  assert.notStrictEqual(id1, id2, "Two thread IDs should be unique");
}

function testGetUnknownIdReturnsUndefined() {
  const store = new ThreadStore();
  assert.strictEqual(store.getThread("no-such-id"), undefined);
}

function testGetAfterCreateReturnsEmptyTurns() {
  const store = new ThreadStore();
  const id = store.createThread();
  const thread = store.getThread(id);
  assert.ok(thread != null, "Thread should exist after create");
  assert.deepStrictEqual(thread.turns, []);
}

function testAppendTurnStoresTurn() {
  const store = new ThreadStore();
  const id = store.createThread();
  store.appendTurn(id, makeTurn("מה בראשית א:א?"));
  const thread = store.getThread(id);
  assert.ok(thread != null);
  assert.strictEqual(thread.turns.length, 1);
  assert.strictEqual(thread.turns[0].userQuery, "מה בראשית א:א?");
}

function testAppendMultipleTurnsPreservesOrder() {
  const store = new ThreadStore();
  const id = store.createThread();
  store.appendTurn(id, makeTurn("שאלה א"));
  store.appendTurn(id, makeTurn("שאלה ב"));
  store.appendTurn(id, makeTurn("שאלה ג"));
  const turns = store.getThread(id)!.turns;
  assert.strictEqual(turns[0].userQuery, "שאלה א");
  assert.strictEqual(turns[1].userQuery, "שאלה ב");
  assert.strictEqual(turns[2].userQuery, "שאלה ג");
}

function testAppendCapsAtMaxTurns() {
  const store = new ThreadStore();
  const id = store.createThread();
  for (let i = 0; i < CONVERSATION_MAX_TURNS + 2; i++) {
    store.appendTurn(id, makeTurn(`שאלה ${i}`));
  }
  const thread = store.getThread(id)!;
  assert.strictEqual(thread.turns.length, CONVERSATION_MAX_TURNS, "Should cap at CONVERSATION_MAX_TURNS");
  // Oldest two turns should have been dropped
  assert.strictEqual(thread.turns[0].userQuery, "שאלה 2");
  assert.strictEqual(thread.turns[CONVERSATION_MAX_TURNS - 1].userQuery, `שאלה ${CONVERSATION_MAX_TURNS + 1}`);
}

function testClearRemovesThread() {
  const store = new ThreadStore();
  const id = store.createThread();
  store.appendTurn(id, makeTurn("שאלה"));
  store.clearThread(id);
  assert.strictEqual(store.getThread(id), undefined);
}

function testClearUnknownIdIsNoop() {
  const store = new ThreadStore();
  // Should not throw
  store.clearThread("nonexistent-id");
}

function testThreadsAreIndependent() {
  const store = new ThreadStore();
  const id1 = store.createThread();
  const id2 = store.createThread();
  store.appendTurn(id1, makeTurn("שאלה א"));
  store.appendTurn(id2, makeTurn("שאלה ב"));
  store.appendTurn(id2, makeTurn("שאלה ג"));
  assert.strictEqual(store.getThread(id1)!.turns.length, 1);
  assert.strictEqual(store.getThread(id2)!.turns.length, 2);
  store.clearThread(id1);
  assert.strictEqual(store.getThread(id1), undefined);
  assert.strictEqual(store.getThread(id2)!.turns.length, 2, "Clearing one thread should not affect another");
}

function run() {
  testCreateReturnsNonEmptyUniqueIds();
  testGetUnknownIdReturnsUndefined();
  testGetAfterCreateReturnsEmptyTurns();
  testAppendTurnStoresTurn();
  testAppendMultipleTurnsPreservesOrder();
  testAppendCapsAtMaxTurns();
  testClearRemovesThread();
  testClearUnknownIdIsNoop();
  testThreadsAreIndependent();
  console.log("threadStore tests passed");
}

run();
