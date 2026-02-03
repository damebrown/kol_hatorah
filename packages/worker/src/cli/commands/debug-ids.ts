import { createChunkId } from "@kol-hatorah/core";

const ID_TEST_SAMPLES = [
  { type: "tanakh", work: "Genesis", normalizedRef: "Genesis 1:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
  { type: "mishnah", work: "Avot", normalizedRef: "Avot 1:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
  { type: "bavli", work: "Berakhot", normalizedRef: "Berakhot 3:1", lang: "he", versionTitle: "merged", source: "sefaria-merged" },
];

export async function debugIdsCommand() {
  const ids1 = ID_TEST_SAMPLES.map((s) => createChunkId(s as any));
  const ids2 = ID_TEST_SAMPLES.map((s) => createChunkId(s as any));
  const same = ids1.every((id, idx) => id === ids2[idx]);
  console.log({ ids1, ids2, deterministic: same });
  if (!same) {
    throw new Error("ID generation is not deterministic across runs");
  }
}
