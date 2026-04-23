import assert from "node:assert";
import type { Chunk } from "@kol-hatorah/core";
import {
  guessSefariaRefFromExportInternal,
  refForSefariaHttpApi,
  type GraphAugmentSqlite,
} from "../src/rag/graphAugmentRetrieval";

const baseChunk = (over: Partial<Chunk>): Chunk => ({
  id: "1",
  text: "t",
  source: "s",
  type: "tanakh_commentary",
  work: "Kli Yakar on Leviticus",
  ref: "e493f000f1fd5ef4:24/1/0",
  normalizedRef: "e493f000f1fd5ef4:24/1/0",
  lang: "he",
  createdAt: "1970-01-01T00:00:00.000Z",
  ...over,
});

{
  const sqlite: GraphAugmentSqlite = {
    getRef: (k: string) =>
      k === "e493f000f1fd5ef4:24/1/0"
        ? {
            id: "1",
            type: "tanakh_commentary",
            work: "Kli Yakar on Leviticus",
            ref: "e493f000f1fd5ef4:24/1/0",
            normalizedRef: "e493f000f1fd5ef4:24/1/0",
            lang: "he",
            source: "sefaria",
            textPlain: "x",
            sefariaCanonicalRef: "Kli Yakar on Leviticus 24:1",
          }
        : null,
  };
  const out = refForSefariaHttpApi(baseChunk({}), sqlite);
  assert.strictEqual(out, "Kli Yakar on Leviticus 24:1");
}

{
  const sqlite: GraphAugmentSqlite = { getRef: () => null };
  const out = refForSefariaHttpApi(baseChunk({ sefariaCanonicalRef: "Guide for the Perplexed, Part 1 61:4" }), sqlite);
  assert.strictEqual(out, "Guide for the Perplexed, Part 1 61:4");
}

{
  assert.strictEqual(
    guessSefariaRefFromExportInternal("Kli Yakar on Leviticus", "e493f000f1fd5ef4:24/1/0"),
    "Kli Yakar on Leviticus 24:1"
  );
  assert.strictEqual(
    guessSefariaRefFromExportInternal("Some on Genesis", "920062d067507725:Genesis/30/16/0"),
    "Some on Genesis 30:16"
  );
  assert.strictEqual(
    guessSefariaRefFromExportInternal("Rashi on Genesis", "abc1234567890123:Genesis/30/16/0"),
    "Rashi on Genesis 30:16"
  );
  assert.strictEqual(
    guessSefariaRefFromExportInternal("Birkat Asher on Torah", "ad70008713308697:Numbers/15/0/9"),
    "Birkat Asher on Torah, Numbers 15:1"
  );
  assert.strictEqual(
    guessSefariaRefFromExportInternal("Karati Bekhol Lev", "af25e1459a5766ab:Beha'alotcha/0/4"),
    "Karati Bekhol Lev Beha'alotcha 1:4"
  );
}

{
  const sqlite: GraphAugmentSqlite = {
    getRef: (k: string) =>
      k === "e493f000f1fd5ef4:24/1/0"
        ? {
            id: "1",
            type: "tanakh_commentary",
            work: "Kli Yakar on Leviticus",
            ref: "e493f000f1fd5ef4:24/1/0",
            normalizedRef: "e493f000f1fd5ef4:24/1/0",
            lang: "he",
            source: "sefaria",
            textPlain: "x",
            sefariaCanonicalRef: null,
          }
        : null,
  };
  const out = refForSefariaHttpApi(baseChunk({}), sqlite);
  assert.strictEqual(out, "Kli Yakar on Leviticus 24:1");
}

console.log("graphAugmentRefResolution.test.ts OK");
