import type { TextType } from "@kol-hatorah/core";

/**
 * Declarative corpus specs: which folders under `<export>/json/` to scan for `Hebrew/merged.json`.
 * Add new works by extending this map — ingestion logic stays generic.
 */
export interface CorpusExportSpec {
  id: string;
  /** `corpus_works.corpus` — stable key for work-level metadata */
  corpusWorksKey: string;
  /** Stored on `segments.type` and used in `createChunkId` */
  segmentType: TextType;
  /** One or more roots relative to `json/` (Sefaria-Export layout). */
  exportRoots: string[];
}

export const CORPUS_PRESETS: Record<string, readonly string[]> = {
  "classical-core": [
    "midrash-rabbah",
    "tanchuma",
    "moreh",
    "mishneh-torah",
    "shulchan-arukh",
    "siddur",
  ],
};

/** CLI alias → canonical id */
const CORPUS_ALIASES: Record<string, string> = {
  "midrash-tanchuma": "tanchuma",
  "rambam": "mishneh-torah",
  "mishneh_torah": "mishneh-torah",
  "shulchan_arukh": "shulchan-arukh",
  "shulchan-aruch": "shulchan-arukh",
};

export const CORPORA_BY_ID: Record<string, CorpusExportSpec> = {
  "midrash-rabbah": {
    id: "midrash-rabbah",
    corpusWorksKey: "midrash_rabbah",
    segmentType: "midrash",
    exportRoots: ["Midrash/Aggadah/Midrash Rabbah"],
  },
  tanchuma: {
    id: "tanchuma",
    corpusWorksKey: "midrash_tanchuma",
    segmentType: "midrash",
    exportRoots: ["Midrash/Aggadah/Midrash Tanchuma"],
  },
  moreh: {
    id: "moreh",
    corpusWorksKey: "guide_for_the_perplexed",
    segmentType: "philosophy",
    /** Primary Hebrew text lives under Rishonim in Sefaria-Export; the book folder often only holds Commentary (skipped by discovery). */
    exportRoots: [
      "Jewish Thought/Rishonim/Guide for the Perplexed",
      "Jewish Thought/Guide for the Perplexed",
    ],
  },
  "mishneh-torah": {
    id: "mishneh-torah",
    corpusWorksKey: "mishneh_torah",
    segmentType: "halacha",
    exportRoots: ["Halakhah/Mishneh Torah"],
  },
  "shulchan-arukh": {
    id: "shulchan-arukh",
    corpusWorksKey: "shulchan_arukh",
    segmentType: "halacha",
    exportRoots: ["Halakhah/Shulchan Arukh"],
  },
  siddur: {
    id: "siddur",
    corpusWorksKey: "siddur_ashkenaz",
    segmentType: "liturgy",
    exportRoots: ["Liturgy/Siddur/Siddur Ashkenaz"],
  },
};

export function normalizeCorpusId(raw: string): string {
  const t = raw.trim().toLowerCase();
  return CORPUS_ALIASES[t] ?? t;
}

export function resolveCorpusIdsFromCli(opts: { corpora?: string; preset?: string }): string[] {
  const preset = opts.preset?.trim();
  if (preset) {
    const list = CORPUS_PRESETS[preset];
    if (!list) {
      throw new Error(`Unknown preset "${preset}". Known: ${Object.keys(CORPUS_PRESETS).join(", ")}`);
    }
    return [...list];
  }
  const raw = opts.corpora?.trim();
  if (!raw) {
    throw new Error('Provide --corpora "<id1>,<id2>,..." or --preset classical-core');
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeCorpusId);
}

export function getCorpusSpec(id: string): CorpusExportSpec {
  const spec = CORPORA_BY_ID[id];
  if (!spec) {
    const known = Object.keys(CORPORA_BY_ID).sort().join(", ");
    throw new Error(`Unknown corpus id "${id}". Known ids: ${known}`);
  }
  return spec;
}

export function listRegisteredCorpusIds(): string[] {
  return Object.keys(CORPORA_BY_ID).sort();
}
