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

// ─── Ibid (שם): resolves to last extracted book ──────────────────────────────

{
  // Sotah 1:8 pattern: named ref then two ibid refs to the same book
  const text = "שֶׁנֶּאֱמַר (שמואל ב יח) וַיָּסֹבּוּ. וּלְפִי שֶׁגָּנַב שֶׁנֶּאֱמַר (שם טו) וַיְגַנֵּב. שֶׁנֶּאֱמַר (שם יח) וַיִּקַּח";
  const { refs } = extractInlineRefs(text);
  assert.deepEqual(refs, ["שמואל ב יח", "שמואל ב טו", "שמואל ב יח"]);
  console.log("✓ ibid (שם) resolves to last named book");
}

{
  // Multiple ibid in sequence all resolve to same last book
  const { refs } = extractInlineRefs("(בראשית א) ראשון (שם ב) שני (שם ג) שלישי");
  assert.deepEqual(refs, ["בראשית א", "בראשית ב", "בראשית ג"]);
  console.log("✓ multiple ibid resolve to same last book");
}

{
  // Ibid with comma separator: (שם, יב) → lastBook יב
  const { refs } = extractInlineRefs("(דברים כ) ועוד (שם, כד) גם");
  assert.deepEqual(refs, ["דברים כ", "דברים כד"]);
  console.log("✓ ibid with comma separator resolved");
}

{
  // Ibid with פסוק prefix: (שם פסוק ט) → lastBook פסוק ט
  const { refs } = extractInlineRefs("(שמות יג) כתוב (שם פסוק ט) גם");
  assert.deepEqual(refs, ["שמות יג", "שמות פסוק ט"]);
  console.log("✓ ibid with פסוק prefix resolved");
}

{
  // Ibid with no prior book context → parenthetical preserved (not extracted)
  const { refs, cleanText } = extractInlineRefs("ראה (שם טו) כאן");
  assert.deepEqual(refs, []);
  assert.ok(cleanText.includes("(שם טו)"), "unresolvable ibid preserved");
  console.log("✓ ibid without prior book context preserved");
}

{
  // Last book updates when a new named ref appears
  const { refs } = extractInlineRefs("(שמות א) ראשון (שם ב) שני (במדבר ה) חדש (שם ו) שישי");
  assert.deepEqual(refs, ["שמות א", "שמות ב", "במדבר ה", "במדבר ו"]);
  console.log("✓ last book updates after new named ref");
}

{
  // Mixed: named refs before ibid across different books (actual Sotah 1:8 pattern)
  const text = "שֶׁנֶּאֱמַר (שופטים טז) וַיֹּאחֲזוּהוּ. שֶׁנֶּאֱמַר (שמואל ב יח) וַיָּסֹבּוּ. שֶׁנֶּאֱמַר (שם טו) וַיְגַנֵּב. שֶׁנֶּאֱמַר (שם יח) וַיִּקַּח";
  const { refs } = extractInlineRefs(text);
  assert.deepEqual(refs, ["שופטים טז", "שמואל ב יח", "שמואל ב טו", "שמואל ב יח"]);
  console.log("✓ Sotah 1:8 full pattern — 4 refs including 2 ibid");
}

console.log("\nAll extractInlineRefs tests passed ✓");
