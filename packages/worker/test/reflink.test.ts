import assert from "assert";
import { ExplicitRefExtractor } from "../src/reflink/detect/ExplicitRefExtractor";
import { linkCandidate } from "../src/reflink/link/linkCandidates";
import { planQuery, QueryIntent } from "../src/queryPlanner";
import { RefDetectMethod } from "../src/reflink/types/RefDetectMethod";

async function testExtractsExplicitRefs() {
  const ext = new ExplicitRefExtractor();
  // Extractor matches Arabic chapter/verse digits (not Hebrew numerals like יט).
  const res = ext.extract("זה נאמר (שמות 19)", { type: "mishnah", work: "סוטה", id: "s1" });
  assert.ok(res.length > 0, "should find explicit ref");
  assert.strictEqual(res[0].candidateKind, "EXPLICIT_REF");
}

async function testLinksExplicitRefsViaSqlite() {
  const cand = {
    sourceSegmentId: "s1",
    normalizedText: "שמות 19",
    rawText: "שמות יט",
    candidateKind: "EXPLICIT_REF",
    signal: "explicit-ref",
    method: RefDetectMethod.EXPLICIT_REF,
    confidenceHint: "HIGH",
  } as any;
  const sqlite = {
    getRef: (ref: string) => (ref.startsWith("שמות") ? { id: "t1", type: "tanakh", work: "שמות", ref: "19:1" } : null),
  };
  const links = await linkCandidate(cand, sqlite, {});
  assert.ok(links.length > 0, "should link explicit ref");
  assert.strictEqual(links[0].status, "CONFIRMED");
}

async function testClassifiesFindReferencesIntent() {
  const plan = await planQuery("מה המקור של הציטוט במסכת סוטה?");
  assert.strictEqual(plan.intent, QueryIntent.FIND_REFERENCES);
}

async function run() {
  await testExtractsExplicitRefs();
  await testLinksExplicitRefsViaSqlite();
  await testClassifiesFindReferencesIntent();
  // eslint-disable-next-line no-console
  console.log("reflink tests passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
