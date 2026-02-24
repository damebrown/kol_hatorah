import assert from "assert";
import { executePlan } from "../src/planner/executePlan";
import { QueryPlan, QueryIntent, ScopeNodeType } from "../src/planner/types";

// Mock sqlite manager
class MockSqlite {
  rows: any[];
  constructor(rows: any[]) {
    this.rows = rows;
  }
  findTerm() {
    return this.rows;
  }
  countTerm() {
    return this.rows.length;
  }
  getByPrefix() {
    return [];
  }
  findTermByWork() {
    return [];
  }
  getSegments() {
    return [];
  }
  countSegments() {
    return 0;
  }
  close() {}
}

async function testRejectsNonTanakhInNeviimScope() {
  const plan: QueryPlan = {
    intent: QueryIntent.WORD_OCCURRENCES,
    scope: { node: { type: ScopeNodeType.SUBCORPUS, name: "נביאים" } },
    strategy: "SQL_ONLY",
    limits: { maxResults: 10, maxSegmentsForSynthesis: 0 },
    debug: { matchedRule: "WORD_OCCURRENCES" },
  };
  const sqlite: any = new MockSqlite([{ type: "mishnah", work: "Shabbat", ref: "Shabbat 1:1", textPlain: "..." }]);
  const result = await executePlan(plan, "q", { generalQaHandler: undefined as any, pagination: { limit: 10, offset: 0 }, sqlite } as any);
  assert.strictEqual(result.kind, "REFUSAL");
}

async function run() {
  await testRejectsNonTanakhInNeviimScope();
  // eslint-disable-next-line no-console
  console.log("scopeFilter tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
