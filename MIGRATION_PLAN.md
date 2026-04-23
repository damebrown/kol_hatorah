# Kol HaTorah — Embedding + Data Migration Plan

**Status**: Planning complete. All decisions made. Ready to implement A1.  
**Last updated**: 2026-04-15

---

## What this plan does

Two complementary migrations:

1. **Re-embed** using Cohere `embed-multilingual-v3.0` instead of OpenAI `text-embedding-3-small` — better Hebrew/Aramaic coverage and asymmetric query vs document embeddings.
2. **Re-ingest clean text** — strip markup/annotations from the display text, extract inline scripture quotes as structured metadata, unify 5 divergent ingest pipelines into one, fix bugs found during planning.

These are split into **Type A (infrastructure — no data changes)** and **Type B (data — modifies SQLite/Qdrant)**.

---

## Decisions already made

| # | Decision | Choice |
|---|---|---|
| A | Nikkud in embedding | Strip nikkud+taamim from the text sent to the embedder. Keep nikkud in `chunk.text` (display). |
| B | Inline scripture refs in text | Strip `(ספר פרק)` from display text. Collect them as `quotedRefs: string[]` metadata. Enable "all works quoting X" queries. |
| C | Kri/Ketiv | Keep only the Qere (`mam-kq-q` span). Discard Ketiv. |
| D | Commentary allowlist | Rashi, Ramban, Ibn Ezra only. Ramban long segments may split into `(part N/M)` — acceptable. |
| E | Corpus reduction strategy | Delete most Tanakh commentary from both DBs, then re-ingest allowlist only. Do NOT delete per-corpus before ingest. |
| F | Corpora to ingest | midrash-rabbah, tanchuma, moreh, mishneh-torah, shulchan-arukh. **Siddur dropped** (too small, adds noise). |
| G | New Qdrant collection | New prefix `hebrag_v3` — old `hebrag_dev` collection survives until verified |
| H | Chunk size for Cohere | 900 chars max (Cohere limit ≈ 512 tokens; Hebrew ≈ 1.5 chars/token) |
| I | Mishneh Torah / Shulchan Arukh granularity | Group consecutive se'ifim within a siman up to 900 chars before embedding. Reduces ~1.5M total segments to ~300–500k. |
| J | Tanakh source version | Use `merged.json` (nikkud version). Strip nikkud/taamim at embed time. Do **not** use `Tanach with Text Only`. |

---

## Sefaria folder structure (verified)

All primary text files use `Hebrew/merged.json`. Confirmed paths:

```
json/Tanakh/Torah/<Book>/Hebrew/merged.json          (39 books)
json/Tanakh/Prophets/<Book>/Hebrew/merged.json
json/Tanakh/Writings/<Book>/Hebrew/merged.json

json/Mishnah/Seder <X>/<Mishnah Tractate>/Hebrew/merged.json   (63 tractates)

json/Talmud/Bavli/Seder <X>/<Tractate>/Hebrew/merged.json      (37 tractates)
  NOTE: Seder layer sits between "Bavli" and tractate name.

json/Halakhah/Mishneh Torah/<Sefer>/<Book>/Hebrew/merged.json  (9078 files)
json/Halakhah/Shulchan Arukh/<Section>/<Book>/Hebrew/merged.json (271 files)

json/Midrash/Aggadah/Midrash Rabbah/<Book>/Hebrew/merged.json
json/Midrash/Aggadah/Midrash Tanchuma/Hebrew/merged.json        (single file)

json/Jewish Thought/Rishonim/Guide for the Perplexed/Hebrew/merged.json  (1 file)
json/Liturgy/Siddur/Siddur Ashkenaz/Hebrew/merged.json          (1 file)

json/Tanakh/Rishonim on Tanakh/Rashi/<Book>/Hebrew/merged.json  (39 files)
json/Tanakh/Rishonim on Tanakh/Ramban/<Group>/<Book>/Hebrew/merged.json  (6 files)
json/Tanakh/Rishonim on Tanakh/Ibn Ezra/<Book>/Hebrew/merged.json (31 files)
```

No edge cases found: Bavli and Mishnah always have the Seder layer, no tractates outside it.

---

## Segment size statistics (post-cleanup, chars)

| Corpus | Files | Segments | Median | P90 | P95 | Max | >900ch | >1800ch |
|---|---|---|---|---|---|---|---|---|
| tanakh | 39 | 23,206 | 59 | 103 | 117 | 232 | 0% | 0% |
| bavli | 37 | 81,793 | 109 | 204 | 238 | 720 | 0% | 0% |
| mishnah | 63 | 4,192 | 212 | 390 | 493 | 1,623 | 0% | 0% |
| rashi | 39 | 28,251 | 60 | 188 | 262 | 2,597 | 0% | 0% |
| ramban | 6 | 3,453 | 327 | 1,434 | 2,152 | 9,958 | **20%** | 6% |
| ibn_ezra | 31 | 20,880 | 58 | 192 | 288 | 7,443 | 0% | 0% |
| midrash_rabbah | 75 | 96,266 | 98 | 365 | 561 | 18,782 | 2% | 0% |
| mishneh_torah | 9,078 | 486,525 | 237 | 1,643 | 3,256 | 87,264 | **18%** | **9%** |
| shulchan_arukh | 271 | 1,023,536 | 163 | 750 | 1,210 | 60,470 | 7% | 2% |
| moreh | 1 | 1,473 | 476 | 1,299 | 1,594 | 3,459 | **22%** | 3% |
| siddur | 1 | 3,731 | 44 | 267 | 420 | 2,775 | 0% | 0% | **dropped** |

**Implication for splitting**: Tanakh, Bavli, Mishnah, Rashi, Siddur never need splitting. Mishneh Torah (18%), Moreh (22%), and Ramban (20%) are the problem corpora.

**Mishneh Torah / Shulchan Arukh size concern**: 486k and 1M segments respectively. These texts are split at se'if (sub-clause) level — most segments are very short (median 163–237 chars). Consider a **segment grouper** that combines consecutive se'ifim within the same Siman/chapter up to the 900-char limit before embedding. This reduces vector count by ~3–5× while keeping semantically coherent chunks.

---

## Bugs found during planning

1. **Moreh discovery broken**: `discoverMergedFiles.ts` skips any directory named `Rishonim` — but the Moreh lives at `Jewish Thought/Rishonim/Guide for the Perplexed`. The skip pattern is too broad. Fix: restrict to skipping `Rishonim` only when it appears as a sibling of a primary text folder (not as a category root).

2. **Commentary ref format broken**: Current commentary ingest (`ingestTanakhCommentaries.ts`) produces refs like `a3f82bc1:5/3/2` instead of `Rashi on Genesis 1:1`. This makes the commentary unsearchable by ref. Fix: route commentary through `enrichSefariaMergedSegment()` like Bavli/Corpora, which calls the Sefaria Name API and returns the canonical ref.

3. **Commentary SQLite opened per file**: `ingestTanakhCommentaries.ts` calls `getSQLiteManager()` and `.close()` inside the per-file loop — O(N) DB opens. Fix: open once, close once (like all other pipelines).

4. **`splitOversizedChunks` not applied to Tanakh/Mishnah**: These segments are always short enough that it's fine, but it should be applied uniformly in the shared runner.

5. **Enrichment timing inconsistency**: Tanakh and Mishnah enrich post-ingest (separate `enrich:metadata` step). Bavli and Corpora enrich inline. Fix: inline enrichment everywhere.

---

## Pollution taxonomy (what to clean)

| Tag | Found in | Clean action |
|---|---|---|
| Taamim `[\u0591-\u05AF]` | Tanakh only | Strip **at embed time only** (keep in stored text) |
| Nikkud `[\u05B0-\u05C7]` | Tanakh + Mishnah | Strip **at embed time only** (keep in stored text) |
| HTML tags `<span>`, `<sup>`, `<small>`, etc. | All corpora | Strip from display text. Special handling for Kri/Ketiv (keep Qere) |
| HTML entities `&nbsp;`, `&lt;`, `&#x200f;` | Tanakh mainly | Decode to plain text or empty |
| `{ס}` `{פ}` paragraph markers | Tanakh (inside `<span class="mam-spi-*">`) | Strip entirely |
| Inline scripture refs `(ספר פרק:פסוק)` | Mishnah + Talmud | Remove from text, store in `quotedRefs[]` metadata |
| Unicode control chars `\u200f \u200e \u200b \ufeff` | Various | Strip |
| Kri/Ketiv `<span class="mam-kq">` | Tanakh | Keep only `mam-kq-q` (Qere), strip span markup |

---

---

# TYPE A — Infrastructure (no data changes)

These steps can be done in any order and don't touch the live database or Qdrant collection.

---

## A1 — Pollution audit script

**File**: `scripts/auditSefaria.ts`  
**Purpose**: Scan all `Hebrew/merged.json` files and produce a JSON report quantifying every pollution type, per file and per corpus.  
**Output**: `eval/pollution_audit.json`  
**No DB writes. No embeddings. Pure read + report.**

Contents of report:
- Per-corpus summary: count of each pollution type
- Per-file detail: path, segment count, pollution counts, worst examples
- Parenthetical refs found: top 50 most-cited refs across each corpus

---

## A2 — Inline ref extractor utility

**File**: `packages/worker/src/ingest/extractInlineRefs.ts`

```ts
// Extracts parenthetical scripture refs embedded in Hebrew text
// Input:  "...שֶׁנֶּאֱמַר (דברים כב) לֹא תִלְבַּשׁ..."
// Output: { cleanText: "...שֶׁנֶּאֱמַר  לֹא תִלְבַּשׁ...", refs: ["דברים כב"] }
export function extractInlineRefs(text: string): { cleanText: string; refs: string[] }
```

Pattern: matches `(X)` where X starts with a known Hebrew book name (Tanakh books + tractate names) followed by optional chapter/verse. Should handle:
- `(בראשית ד)` — book + chapter
- `(בראשית ד, ה)` — book + chapter + verse  
- `(שמות כ:ב)` — colon separator
- `(ויקרא ה)` — 3-letter book names

Write unit tests first (`packages/worker/test/extractInlineRefs.test.ts`):
- Happy path: single ref stripped correctly
- Multiple refs in one segment
- Ref at start/end of segment
- Non-ref parenthetical (name, date) not stripped
- Edge: `(ויקרא)` without chapter — keep? (yes, it's still a citation)

---

## A3 — Schema additions (additive, backward-compatible)

**No data migration needed — only adds new nullable columns and fields.**

### `Chunk` type (`packages/core/src/types.ts`):
```ts
quotedRefs?: string[];       // extracted inline refs, e.g. ["בראשית ד", "ויקרא ה"]
textEmbed?: string;          // nikkud-stripped version used for embedding (optional, not stored in Qdrant payload)
```

### SQLite schema (`packages/worker/src/storage/sqlite/schema.ts`):
```sql
ALTER TABLE segments ADD COLUMN quotedRefsJson TEXT;  -- JSON array
```

### New SQLite queries (`queries.ts`):
```ts
// "all segments that quote ref X"
findSegmentsQuotingRef(ref: string, scope?: ScopeFilter): Array<SegmentRow>

// "all quoted refs in work Y"  
listQuotedRefsForWork(work: string): Array<{ ref: string; count: number }>
```

### `SegmentEnrichmentUpdate` (`types.ts`):
Add `quotedRefsJson: string | null` field.

---

## A4 — Embedding service abstraction

**Files**:
- `packages/core/src/embedding.ts` — new interface
- `packages/core/src/cohere.ts` — Cohere implementation
- Update `packages/core/src/openai.ts` — implement interface
- Update `packages/core/src/index.ts` — export new types
- Update `packages/core/src/config.ts` — new env vars
- Add `cohere-ai` to `packages/core/package.json`

### Interface (`embedding.ts`):
```ts
export interface EmbeddingService {
  embedTexts(
    texts: string[],
    opts?: { inputType?: "search_document" | "search_query"; batchSize?: number }
  ): Promise<number[][]>;
  readonly modelDim: number;
}
```

### `CohereEmbeddingService` (`cohere.ts`):
- Model: `embed-multilingual-v3.0` (1024 dims)
- Pre-processes text before API call: strips nikkud `[\u05B0-\u05C7]` and taamim `[\u0591-\u05AF]` (Decision A1)
- Uses `input_type: "search_document"` during ingest, `"search_query"` during retrieval
- Retry + rate-limit logic mirroring `OpenAIService`
- `modelDim = 1024`

### Config additions (`.env.example` + `config.ts`):
```
COHERE_API_KEY=
COHERE_EMBEDDING_MODEL=embed-multilingual-v3.0
EMBEDDING_PROVIDER=cohere    # or "openai" (default: "openai" for backward compat)
```

### `OpenAIService` changes:
- Implements `EmbeddingService`
- `modelDim = 1536` (text-embedding-3-small)
- No other changes (backward compatible)

### Factory function:
```ts
// packages/core/src/embedding.ts
export function createEmbeddingService(config: Config): EmbeddingService
```
Returns `CohereEmbeddingService` or `OpenAIService` based on `EMBEDDING_PROVIDER`.

### Query-time change:
In `packages/core/src/rag.ts` (and `sefariaGraphClient.ts`): replace `openaiService.embedTexts(query)` with `embeddingService.embedTexts([query], { inputType: "search_query" })`.

---

## A5 — Content-aware chunk splitter improvements

**File**: `packages/worker/src/ingest/splitOversizedChunks.ts`

**Change `MAX_EMBED_CHARS` from 3000 to 900** (Cohere 512-token limit at ~1.5 chars/token).

**Improve `splitLongText`**: after paragraph/line split, before fixed-window fallback, try **clause-boundary split** for Hebrew:
- Split on `: ` (very common halakhic clause separator) followed by a Hebrew letter
- Split on `. ` followed by a Hebrew letter  
- Split on `׃` (sof pasuk)
This avoids cutting mid-sentence as a last resort.

**Add `groupShortSegments`**: required for Mishneh Torah and Shulchan Arukh (decided).
```ts
// Groups consecutive short segments (from the same parent ref/siman) 
// up to maxChars, preserving semantic coherence of halakhic units.
export function groupShortSegments<T extends { text: string; ref: string }>(
  segments: T[],
  maxChars: number
): T[]
```
Strategy: consecutive segments whose `ref` shares the same siman-level prefix (up to the last `:`) are candidates for grouping. Combine until next segment would exceed limit. Grouped segment takes the ref of the first constituent and appends `–N` for the last.

---

## A6 — Clean copy pipeline script

**File**: `scripts/cleanSefaria.ts`

Reads from `SEFARIA_EXPORT_PATH/json/`, writes to `SEFARIA_CLEAN_PATH/json/`, mirroring exact directory and file structure.

**Only processes `Hebrew/merged.json` files.** All other files copied verbatim.

**`cleanSegment(raw: string): { displayText: string; quotedRefs: string[] }`**:

1. **Kri/Ketiv**: find `<span class="mam-kq">...</span>`, extract content of inner `mam-kq-q` span, replace entire outer span with just that text
2. **Strip HTML tags** (after Kri/Ketiv handling)
3. **Decode HTML entities**: `&nbsp;` → ` `, `&lt;` → `<`, `&gt;` → `>`, `&#x200f;` and similar → `` (empty), `&amp;` → `&`
4. **Strip `{ס}` `{פ}` paragraph markers**: regex `\{[פס]\}` and surrounding whitespace
5. **Strip Unicode control chars**: `\u200f \u200e \u200b \ufeff`
6. **Extract inline refs** via `extractInlineRefs()` (from A2) → collect in `quotedRefs`, return cleaned text
7. **Normalize whitespace**: collapse `\s+` to single space, trim

The cleaned JSON preserves the entire original structure. The `text` field nested arrays are preserved but each string leaf is replaced by its `displayText`. A parallel `_quotedRefsIndex` field is added at file root: `Record<segmentRef, string[]>` mapping export ref → extracted inline refs.

**CLI**:
```bash
npx tsx scripts/cleanSefaria.ts [--dry-run] [--corpus <id>] [--input <path>] [--output <path>]
```

**New env var**: `SEFARIA_CLEAN_PATH` — when set, ingest commands read from here instead of `SEFARIA_EXPORT_PATH`.

---

## A7 — Pipeline unification refactor

**Goal**: eliminate ~500 lines of duplicated code across the 5 ingest pipelines without changing behavior.

### What gets unified

All 5 pipelines share: file loading, batch loop, enrichment API calls, SQLite insert, embed call, Qdrant upsert, checkpoint write. Only the **file discovery** and **ref building** differ.

### New shared runner

**File**: `packages/worker/src/ingest/runIngestCorpus.ts`

```ts
export interface CorpusIngestSpec {
  corpusId: string;
  segmentType: TextType;
  mergedFiles: string[];        // pre-discovered list of absolute paths to Hebrew/merged.json
  getWork: (parsed: MergedJson) => string;
  buildLeaves: (parsed: MergedJson, work: string) => Array<{ exportRef: string; text: string }>;
}

export async function runIngestCorpus(spec: CorpusIngestSpec, opts: CommonIngestOpts): Promise<void>
```

`runIngestCorpus` handles: checkpoint load/save, SQLite open/close, batch loop, `extractInlineRefs`, `enrichSefariaMergedSegment`, `groupShortSegments` (if applicable), `splitOversizedChunks`, SQLite write, Cohere embed, Qdrant upsert.

### Per-corpus thin wrappers

Each pipeline becomes a thin file that only does discovery + spec construction:

| Pipeline | Discovery | `buildLeaves` impl |
|---|---|---|
| `ingestTanakh.ts` | scan `Torah/Prophets/Writings` dirs | `flattenVersionText` |
| `ingestMishnah.ts` | scan `Seder X/Tractate` dirs | `flattenVersionText` |
| `ingestBavli.ts` | explicit tractate list | `loadBavliLeavesFromMergedText` + daf mapping |
| `ingestCorpora.ts` | registry → `listHebrewMergedJsonUnder` | `flattenMergedExportText` |
| `ingestCommentary.ts` | scan `Rishonim on Tanakh/Rashi`, `Ramban`, `Ibn Ezra` | `extractCommentaryLeaves` |

### Commentary fix

Commentary now routes through `enrichSefariaMergedSegment()` like Bavli/Corpora. The `extractCommentaryLeaves` helper still does tree traversal; it now emits a Sefaria-style export ref (e.g. `Rashi on Genesis 1:1`) that the Name API can resolve into a canonical ref. The broken `docId:encodedSectionPath` format is gone.

### Enrichment timing unified

All pipelines enrich inline during ingest. The separate `enrich:metadata` CLI command remains as a repair tool for any segments that failed enrichment, but is no longer needed as a required post-ingest step.

### Bug fixes included

- **Moreh discovery fix**: in `discoverMergedFiles.ts`, change `SKIP_DIR_BASENAME_RE` to not skip `Rishonim` when it appears as an immediate child of `Jewish Thought/` (i.e., skip only when it's a sibling of the work's `Hebrew/` directory, not when it's a top-level category)
- **SQLite per-file bug fixed**: commentary now opens SQLite once
- **Checkpoint helper extracted**: `packages/worker/src/ingest/checkpoint.ts` with `loadCheckpoint` / `saveCheckpoint`

---

---

# TYPE B — Data steps

**Run these only after all Type A work is complete and tested.**

---

## B0 — Pre-ingest ref format validation

Before re-ingesting each corpus, run 5 sample refs through the Sefaria Name API and verify they resolve. Log mismatches. Fail loudly if >20% fail to resolve.

This catches corpus-specific ref format issues before a full ingest run.

---

## B1 — Run pollution audit

```bash
npx tsx scripts/auditSefaria.ts
# Output: eval/pollution_audit.json
```

Review the report. Adjust cleaning rules in A6 if unexpected patterns are found.

---

## B2 — Run clean copy pipeline

```bash
npx tsx scripts/cleanSefaria.ts --dry-run   # verify first
npx tsx scripts/cleanSefaria.ts             # write to SEFARIA_CLEAN_PATH
```

Manually spot-check 5–10 output files from different corpora. Verify:
- Nikkud present (not stripped at this stage)
- HTML completely removed
- `{ס}` `{פ}` gone
- Inline refs removed from text, present in `_quotedRefsIndex`
- No truncation / structure corruption

---

## B3 — Commentary corpus reduction

This runs before re-ingesting commentary.

### SQLite
```sql
-- Keep only Rashi, Ramban, Ibn Ezra
DELETE FROM segments 
WHERE type = 'tanakh_commentary' 
  AND work NOT LIKE 'Rashi on %'
  AND work NOT LIKE 'Ramban on %'
  AND work NOT LIKE 'Ibn Ezra on %';
```

### Qdrant
Delete all `tanakh_commentary` points from the old collection:
```bash
npx tsx src/cli.ts qdrant-delete-by-filter --type tanakh_commentary
```
(Uses the existing `qdrantDeleteByFilter` CLI command)

---

## B4 — Re-ingest into new collection

New collection: `hebrag_v3_chunks_v2` (1024-dim Cohere vectors).

**Set env vars before running**:
```
QDRANT_COLLECTION_PREFIX=hebrag_v3
EMBEDDING_PROVIDER=cohere
SEFARIA_CLEAN_PATH=/path/to/Sefaria-Export-clean
```

**Ingest order** (small → large, smoke test after each):

```bash
# 1. Mishnah — smallest primary text, cleanest, no API complexity
npm --workspace packages/worker run ingest:mishnah

# 2. Tanakh
npm --workspace packages/worker run ingest:tanakh

# 3. Bavli core tractates first, then full
npm --workspace packages/worker run ingest:bavli -- --tractates bavli-core
npm --workspace packages/worker run ingest:bavli

# 4. Commentary (allowlisted: Rashi + Ramban + Ibn Ezra)
npm --workspace packages/worker run ingest:tanakh-commentaries

# 5. Corpora (cheapest first)
npm --workspace packages/worker run ingest:corpora -- --corpora moreh,tanchuma
npm --workspace packages/worker run ingest:corpora -- --corpora midrash-rabbah
npm --workspace packages/worker run ingest:corpora -- --corpora mishneh-torah
npm --workspace packages/worker run ingest:corpora -- --corpora shulchan-arukh
```

After each corpus: run 3–5 representative queries against the new collection and compare with the old one.

---

## B5 — Retire old collection

After quality verified:
```bash
npx tsx src/cli.ts qdrant-delete-collection --name hebrag_dev_chunks_v2
```

Update `.env` to remove `hebrag_v3` prefix (or rename to `hebrag_dev`).

---

## Implementation order summary

```
A1 auditSefaria script
A2 extractInlineRefs utility + tests
A3 schema additions (Chunk, SQLite, queries)
A4 EmbeddingService interface + CohereEmbeddingService
A5 splitOversizedChunks improvements (900 limit, clause split, groupShortSegments)
A6 cleanSefaria script
A7 pipeline unification + bug fixes
────────────────────────────────
B0 ref format validation (pre-ingest)
B1 run pollution audit → review
B2 run clean copy → spot-check
B3 commentary reduction (SQLite delete + Qdrant delete)
B4 re-ingest corpus by corpus
B5 retire old collection
```

---

## All decisions made — no open questions
