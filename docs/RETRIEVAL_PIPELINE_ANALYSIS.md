# Retrieval Pipeline: Exact Locations and Behavior

## 1. Where does vector search happen?

| Location | Function |
|----------|----------|
| `packages/core/src/qdrant.ts` | `searchByVector(client, collectionName, queryVector, opts)` |

**Call site:** `packages/worker/src/cli/commands/ask.ts` line 125, inside `askOnce()`:

```ts
const searchResults = await searchByVector(qdrantClient, collectionName, queryEmbedding, { limit, type, work, source: undefined, lang: "he" });
```

---

## 2. Where is the final context assembled before being sent to the LLM?

| Location | Function |
|----------|----------|
| `packages/core/src/rag.ts` | `buildRagPrompt(question, chunks)` |

**Logic (lines 4–11):**
```ts
const context = chunks
  .map((chunk) => `Source: ${chunk.work}, Ref: ${chunk.ref}\nText: ${chunk.text}`)
  .join("\n\n");
const input = `שאלה: ${question}\n\nהקשר:\n${context}`;
return { instructions, input };
```

**Call site:** `packages/worker/src/cli/commands/ask.ts` line 146:
```ts
const { instructions, input } = buildRagPrompt(query, chunks);
```

**LLM call:** `packages/worker/src/cli/commands/ask.ts` line 150:
```ts
const openaiResponse = await openaiService.getResponse({ model: config.openai.chatModel, instructions, input });
```

**LLM implementation:** `packages/core/src/openai.ts` lines 174–195, `getResponse()`.

---

## 3. Does the retrieval pipeline combine SQLite and Qdrant?

**No.** SQLite and Qdrant are used in separate, mutually exclusive paths.

**File:** `packages/worker/src/cli/commands/ask.ts`, function `askOnce()`.

**Path A (lines 38–108):** `exactRefMatch || keywordPattern.test(query)` → SQLite only
- `sqlite.getRef(refNorm)` (exact ref)
- `sqlite.findTerm(norm.textNorm, { type, work }, limit)` (keyword)
- No Qdrant, no LLM. Returns immediately.

**Path B (lines 110–165):** else → Qdrant only
- `searchByVector(...)` for retrieval
- `buildRagPrompt()` + `getResponse()` for LLM
- No SQLite for retrieval in this path.

There is no layer that merges or hybridizes SQLite and Qdrant results.

---

## 4. How are sources/citations constructed?

**File:** `packages/core/src/citations.ts`

| Function | Purpose |
|----------|----------|
| `deduplicateCitations(chunks)` | Build citations from chunks, dedup by `work\|ref` |
| `displayCitation(citation)` | Format as `work ref` (strips trailing `.\d+` only) |
| `formatCitations(citations)` | Format as `[1] work ref, [2] work ref, ...` |

**Citation source:** `chunk.work` and `chunk.ref` (lines 26–29 in citations.ts):
```ts
const key = `${chunk.work}|${chunk.ref}`;
citations.push({ work: chunk.work, ref: chunk.ref });
```

- **Per chunk:** Yes. Each chunk contributes one citation (after dedup by `work|ref`).
- **Ref source:** `chunk.ref` (not `normalizedRef`).
- **displayCitation:** Strips `.\d+` suffix only. Does **not** strip `(part X/N)`.

**Call site:** `packages/worker/src/cli/commands/ask.ts` lines 153–154:
```ts
const citations = deduplicateCitations(chunks);
const formattedCitations = formatCitations(citations);
```

**If we merge parts:** With one merged chunk per baseRef, we get one citation per baseRef. With per-part chunks, we get one citation per part (e.g. `X (part 1/3)`, `X (part 2/3)`). Collapsing to baseRef is preferable for merged units.

---

## 5. Existing logic that assumes one chunk = one semantic unit

**`packages/core/src/rag.ts`** `buildRagPrompt()` (lines 5–7):
```ts
const context = chunks
  .map((chunk) => `Source: ${chunk.work}, Ref: ${chunk.ref}\nText: ${chunk.text}`)
  .join("\n\n");
```

- Each chunk → one `Source: work, Ref: ref` block.
- No notion of “group” or “baseRef”; each chunk is independent.

**`packages/core/src/citations.ts`** `deduplicateCitations()`:
- One citation per chunk (by `work|ref`).
- No grouping by baseRef.

**Impact of expansion:**
- **Ranking:** `chunks` and `scores` come from vector search. Expansion adds siblings; we can keep the best score for the group.
- **Scoring:** `shouldAnswer(chunks, scores, config)` uses `chunks.length` and `scores`. If we replace N parts with 1 merged chunk, we reduce chunk count. Need to decide how to treat merged chunks for `minSources` / `minScore`.
- **Citation formatting:** Works with merged chunks if we use `ref = baseRef`. `displayCitation` does not need changes for baseRef.

---

## 6. Hard limits before calling the LLM

**File:** `packages/core/src/config.ts` – `rag` config:
- `topK`: default 8 (limit for vector search)
- `minSources`: default 2 (minimum chunks for `shouldAnswer`)
- `minScore`: optional

**File:** `packages/core/src/rag.ts` – `shouldAnswer()` (lines 16–30):
- Rejects if `chunks.length < config.rag.minSources`
- Optionally rejects if top-k scores are below `config.rag.minScore`

**File:** `packages/core/src/openai.ts` – `getResponse()`:
- `max_output_tokens`: default 500 (output only)
- No limit on input/context length in our code

**Enforced limits:**

| Limit | Value | Where |
|-------|-------|-------|
| Max chunks from search | `config.rag.topK` (default 8) | `searchByVector(..., { limit })` in ask.ts:125 |
| Min chunks to proceed | `config.rag.minSources` (default 2) | `shouldAnswer()` in rag.ts:18 |
| Max output tokens | 500 (default) | `getResponse()` in openai.ts:193 |
| Max input chunks | None | buildRagPrompt accepts all chunks |
| Max input characters | None | No truncation before LLM |
| Max input tokens | None | Relies on model context window |

---

## 7. Summary: Insertion point for expansion

**Best place for expansion:** Between vector search and `buildRagPrompt`.

**Current flow (ask.ts):**
1. Line 125: `searchResults = searchByVector(...)`
2. Line 126: `chunks = searchResults.map(r => r.chunk)`
3. Line 127: `scores = searchResults.map(r => r.score)`
4. Line 129: `shouldAnswer(chunks, scores, config)`
5. Line 146: `buildRagPrompt(query, chunks)`
6. Line 153: `deduplicateCitations(chunks)`

**Proposed expansion step:** After line 126, before line 129:
- For each chunk whose `ref` matches `(part \d+/\d+)`, extract baseRef
- Fetch siblings from SQLite by baseRef
- Replace part-chunks with merged chunks (one per baseRef, `ref = baseRef`, `text = concatenated parts`)
- Recompute or propagate scores for `shouldAnswer` (e.g. use max score of the group)
- Pass expanded chunks to `shouldAnswer`, `buildRagPrompt`, and `deduplicateCitations`
