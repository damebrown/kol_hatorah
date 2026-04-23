/**
 * A2 — unit tests for extractInlineRefs
 * Run: npx tsx packages/worker/test/extractInlineRefs.test.ts
 */
import assert from "node:assert/strict";
import { extractInlineRefs } from "../src/ingest/extractInlineRefs";

// ─── Happy path: single ref stripped ────────────────────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("שֶׁנֶּאֱמַר (דברים כב) לֹא תִלְבַּשׁ");
  assert.deepEqual(refs, ["דברים כב"]);
  assert.equal(cleanText.includes("(דברים כב)"), false);
  assert.ok(cleanText.includes("שֶׁנֶּאֱמַר"), "surrounding text preserved");
  assert.ok(cleanText.includes("לֹא תִלְבַּשׁ"), "trailing text preserved");
  console.log("✓ single ref stripped");
}

// ─── Multiple refs in one segment ────────────────────────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("כדכתיב (בראשית א) בהתחלה ועוד (שמות כ:ב) בסוף");
  assert.deepEqual(refs, ["בראשית א", "שמות כ:ב"]);
  assert.equal(cleanText.includes("(בראשית א)"), false);
  assert.equal(cleanText.includes("(שמות כ:ב)"), false);
  console.log("✓ multiple refs in one segment");
}

// ─── Ref at start of segment ─────────────────────────────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("(ויקרא ה) כאשר נאמר שם");
  assert.deepEqual(refs, ["ויקרא ה"]);
  assert.equal(cleanText.trimStart().startsWith("("), false);
  console.log("✓ ref at start of segment");
}

// ─── Ref at end of segment ───────────────────────────────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("כאשר כתיב (במדבר יב:ו)");
  assert.deepEqual(refs, ["במדבר יב:ו"]);
  assert.equal(cleanText.trimEnd().endsWith(")"), false);
  console.log("✓ ref at end of segment");
}

// ─── Book + chapter + verse with comma separator ──────────────────────────────

{
  const { refs } = extractInlineRefs("כמו שנאמר (בראשית ד, ה) ויאמר");
  assert.deepEqual(refs, ["בראשית ד, ה"]);
  console.log("✓ book + chapter + verse with comma separator");
}

// ─── Non-ref parenthetical: person name not stripped ────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("אמר ר' יוחנן (פירוש המשנה) שהדבר");
  assert.equal(refs.length, 0, "non-book parenthetical should not be extracted");
  assert.ok(cleanText.includes("(פירוש המשנה)"), "non-ref parens preserved");
  console.log("✓ non-ref parenthetical preserved");
}

// ─── Non-ref parenthetical: number alone not stripped ───────────────────────

{
  const { cleanText, refs } = extractInlineRefs("הכלל (3) בדין");
  assert.equal(refs.length, 0);
  assert.ok(cleanText.includes("(3)"), "numeric parens preserved");
  console.log("✓ numeric parenthetical preserved");
}

// ─── Book name only, no chapter — keep as citation ──────────────────────────

{
  const { refs } = extractInlineRefs("כמו שנאמר (ויקרא)");
  assert.deepEqual(refs, ["ויקרא"]);
  console.log("✓ book name only (no chapter) captured as citation");
}

// ─── Multi-word book name ─────────────────────────────────────────────────────

{
  const { refs } = extractInlineRefs("כדכתיב (שמואל א יז) ויפול");
  assert.deepEqual(refs, ["שמואל א יז"]);
  console.log("✓ multi-word book name (שמואל א)");
}

// ─── Mishnah tractate name ────────────────────────────────────────────────────

{
  const { refs } = extractInlineRefs("כדתנן (ברכות ב:א) שם");
  assert.deepEqual(refs, ["ברכות ב:א"]);
  console.log("✓ Mishnah tractate ref extracted");
}

// ─── Whitespace after removal: extractInlineRefs strips only the token ───────
// Whitespace normalization is the caller's responsibility.

{
  const { cleanText } = extractInlineRefs("לפני  (בראשית א)  אחרי");
  // 2 spaces before + 2 spaces after the removed token = 4 spaces remaining
  assert.equal(cleanText, "לפני    אחרי");
  console.log("✓ whitespace around removed ref (caller normalizes)");
}

// ─── Empty string ────────────────────────────────────────────────────────────

{
  const { cleanText, refs } = extractInlineRefs("");
  assert.equal(cleanText, "");
  assert.deepEqual(refs, []);
  console.log("✓ empty string");
}

// ─── No refs in plain text ───────────────────────────────────────────────────

{
  const input = "זה הוא הטקסט ללא כל הפניות";
  const { cleanText, refs } = extractInlineRefs(input);
  assert.equal(cleanText, input);
  assert.deepEqual(refs, []);
  console.log("✓ plain text unchanged");
}

console.log("\nAll extractInlineRefs tests passed ✓");
