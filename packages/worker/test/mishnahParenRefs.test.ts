import assert from "assert";
import { parseTanakhRefHebrewFromMarker } from "../src/reflink/parseTanakhRefHebrew";
import { MishnahParentheticalTanakhRefExtractor } from "../src/reflink/detect/MishnahParentheticalTanakhRefExtractor";
import { linkExplicitTanakhRef } from "../src/reflink/link/linkExplicitTanakhRef";
import { resolveVerseFromChapter, extractQuoteWindow } from "../src/reflink/resolveVerseFromQuote";
import { runMishnahParenRefs } from "../src/reflink/runMishnahParenRefs";

function testParserEzekiel23() {
  const r = parseTanakhRefHebrewFromMarker("יחזקאל כג");
  assert.ok(r);
  assert.strictEqual(r?.workCanon, "Ezekiel");
  assert.strictEqual(r?.chapter, 23);
  assert.strictEqual(r?.verse, null);
  assert.strictEqual(r?.normalizedRefPrefix, "Ezekiel 23:");
}

function testParserEzekiel23_14() {
  const r = parseTanakhRefHebrewFromMarker("יחזקאל כג:יד");
  assert.ok(r);
  assert.strictEqual(r?.workCanon, "Ezekiel");
  assert.strictEqual(r?.chapter, 23);
  assert.strictEqual(r?.verse, 14);
  assert.strictEqual(r?.normalizedRefPrefix, "Ezekiel 23:14");
}

function testParserRejectsRandom() {
  const r = parseTanakhRefHebrewFromMarker("ועתידתיהם");
  assert.strictEqual(r, null);
}

function testExtractorFindsInSotah() {
  const ext = new MishnahParentheticalTanakhRefExtractor();
  const text = "שנאמר (יחזקאל כג) ונוסרו כל הנשים";
  const cands = ext.extract(text, { type: "mishnah", work: "Mishnah Sotah", ref: "1:6" });
  assert.ok(cands.length >= 1);
  assert.strictEqual(cands[0].signal, "PAREN_REF");
  assert.strictEqual(cands[0].candidateKind, "EXPLICIT_REF");
  assert.strictEqual(cands[0].rawRefString, "יחזקאל כג");
}

function testExtractorIgnoresNonMishnah() {
  const ext = new MishnahParentheticalTanakhRefExtractor();
  const cands = ext.extract("(יחזקאל כג)", { type: "bavli" });
  assert.strictEqual(cands.length, 0);
}

function testShamContextResolution() {
  const r = parseTanakhRefHebrewFromMarker("שם כ", { lastBookCanon: "Exodus" });
  assert.ok(r);
  assert.strictEqual(r?.workCanon, "Exodus");
  assert.strictEqual(r?.chapter, 20);
  assert.strictEqual(r?.verse, null);
  assert.strictEqual(r?.isSham, true);
}

function testShamWithoutContextReturnsNull() {
  const r = parseTanakhRefHebrewFromMarker("שם כז");
  assert.strictEqual(r, null);
}

function testExtractorShamSequence() {
  const ext = new MishnahParentheticalTanakhRefExtractor();
  const seg1 = "נאמר (שמות יט) דבר";
  const seg2 = "והוא אומר (שם כ) עוד";
  const { candidates: c1, lastBookCanon: ctx } = ext.extractWithContext(seg1, { type: "mishnah", id: "s1" });
  assert.ok(c1.length >= 1);
  assert.strictEqual(c1[0].rawRefString, "שמות יט");
  assert.strictEqual(ctx, "Exodus");

  const { candidates: c2 } = ext.extractWithContext(seg2, { type: "mishnah", id: "s2" }, { lastBookCanon: ctx });
  assert.ok(c2.length >= 1);
  assert.strictEqual(c2[0].rawRefString, "שם כ");
  assert.ok(c2[0].parsedRef);
  assert.strictEqual(c2[0].parsedRef!.workCanon, "Exodus");
}

function testResolveVerseFromChapter() {
  const quoteWindow = "ונוסרו כל הנשים";
  const chapterVerses = [
    { ref: "23:1", textPlain: "ואש אחרת", verseNum: 1 },
    { ref: "23:14", textPlain: "ונוסרו כל הנשים ולא תעשנה", verseNum: 14 },
    { ref: "23:20", textPlain: "דבר אחר", verseNum: 20 },
  ];
  const { resolved } = resolveVerseFromChapter(quoteWindow, chapterVerses, "Ezekiel", 23);
  assert.ok(resolved.length >= 1);
  assert.strictEqual(resolved[0].verseNum, 14);
  assert.ok(resolved[0].score >= 0.35);
}

function testExtractorRejectsNonRefParens() {
  const ext = new MishnahParentheticalTanakhRefExtractor();
  const cands = ext.extract("זה (ועתידתיהם) לא ספר", { type: "mishnah" });
  assert.strictEqual(cands.length, 0);
}

function testLinkerFetchesTanakh() {
  const sqlite = {
    getRef: (r: string) => (r === "Ezekiel 23:14" ? { id: "x", type: "tanakh", work: "Ezekiel", ref: "23:14", textPlain: "verse text" } : null),
    getByPrefix: (p: string) => (p.startsWith("Ezekiel 23:") ? [{ id: "x", type: "tanakh", work: "Ezekiel", ref: "23:1", textPlain: "verse" }] : []),
  };
  const cand = {
    rawRefString: "יחזקאל כג",
    rawText: "יחזקאל כג",
    candidateKind: "EXPLICIT_REF",
    sourceSegmentId: "s1",
  } as any;
  const links = linkExplicitTanakhRef(cand, sqlite);
  assert.ok(links.length >= 1);
  assert.strictEqual(links[0].targetWork, "Ezekiel");
  assert.strictEqual(links[0].status, "CONFIRMED");
}

/** Integration: segment with ref "Sotah 7:8" must produce mishnahRefHeb "סוטה ז:ח" (not סוטה א:ח). */
async function testRunMishnahParenRefsPreservesChapter() {
  const segmentWithCh7 = {
    id: "mishnah-sotah-7-8",
    type: "mishnah",
    work: "Sotah",
    ref: "Sotah 7:8",
    textPlain: "וברכות וקללות (דברים כח) עד שגומר כל הפרשה",
  };
  const sqlite = {
    countSegments: () => 1,
    getSegments: (_scope: unknown, _limit: number, _offset: number) => [segmentWithCh7],
    getByPrefix: (p: string) =>
      p.startsWith("Deuteronomy 28:")
        ? [{ id: "t1", type: "tanakh", work: "Deuteronomy", ref: "28:1", normalizedRef: "Deuteronomy 28:1", textPlain: "verse" }]
        : [],
  };
  const scope = { type: "mishnah" as string, workIn: ["Sotah", "Mishnah Sotah"] };
  const { matches } = await runMishnahParenRefs(sqlite, scope);
  assert.ok(matches.length >= 1);
  const hit = matches.find((m) => m.markerText?.includes("דברים כח"));
  assert.ok(hit, "expected hit for (דברים כח)");
  assert.strictEqual(hit!.mishnahRefHeb, "סוטה ז:ח", "chapter must be 7 (ז), not 1 (א)");
  assert.strictEqual(hit!.mishnahRef, "Sotah 7:8");
}

function run() {
  testParserEzekiel23();
  testParserEzekiel23_14();
  testParserRejectsRandom();
  testShamContextResolution();
  testShamWithoutContextReturnsNull();
  testExtractorFindsInSotah();
  testExtractorShamSequence();
  testExtractorIgnoresNonMishnah();
  testExtractorRejectsNonRefParens();
  testResolveVerseFromChapter();
  testLinkerFetchesTanakh();
  // eslint-disable-next-line no-console
  console.log("mishnahParenRefs tests passed");
}

async function runAsync() {
  run();
  await testRunMishnahParenRefsPreservesChapter();
  // eslint-disable-next-line no-console
  console.log("mishnahParenRefs integration test passed");
}

runAsync();
