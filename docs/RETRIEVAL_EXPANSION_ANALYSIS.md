# Retrieval-Time Expansion: Structural Analysis

## 1) What exactly is `family`?

**Source:** `ingestTanakhCommentaries.ts` lines 44–48, 212–213

```ts
function getFamilyFromRelPath(relPath: string): CommentaryFamily {
  if (relPath.startsWith("Rishonim on Tanakh/")) return "rishonim";
  if (relPath.startsWith("Acharonim on Tanakh/")) return "acharonim";
  if (relPath.startsWith("Modern Commentary on Tanakh/")) return "modern";
  return "rishonim";
}
const family = getFamilyFromRelPath(relPath);
```

- **Values:** `"rishonim"` | `"acharonim"` | `"modern"`
- **Granularity:** Per merged.json file (document level). Derived from the top-level directory in the Sefaria path.
- **Example relPath:** `"Acharonim on Tanakh/Ba'alei Brit Avram/Genesis/Hebrew/merged.json"` → `family = "acharonim"`
- **Uniqueness:** No. Many merged.json files share the same family (e.g. all Acharonim commentaries). Family does **not** uniquely identify a single split-document scope.

---

## 2) What is the granularity of `part_index`?

**Correction:** There is **no** `part_index` field in the payload. Part information exists only in the `ref` string.

**Source:** `splitOversizedChunks.ts` lines 115–127

```ts
for (let i = 0; i < parts.length; i++) {
  const partNum = i + 1;
  const partRef = parts.length > 1 ? `${c.ref} (part ${partNum}/${parts.length})` : c.ref;
  result.push({ ...c, id, text: parts[i], ref: partRef, normalizedRef: partRef });
}
```

- **Where it lives:** In `ref`, e.g. `"abc123:1.2.3 (part 2/3)"`
- **Scope:** Sequential only within one original chunk. Each split is independent.
- **Format:** 1-based, contiguous (1..N). No gaps.
- **`part_count`:** Not stored as a field; it appears in the ref string as the denominator in `(part X/N)`.
- **Extraction:** `const match = ref.match(/\(part (\d+)\/(\d+)\)/);` → `partIndex = match[1]`, `partCount = match[2]`

---

## 3) What is the most reliable grouping key?

| Field       | Uniqueness for split unit | Shared across unrelated parts? |
|------------|----------------------------|---------------------------------|
| `family`   | No                         | Yes – many commentaries share family |
| `sourcePath` | No                       | Yes – one merged.json has many leaves |
| `work`     | No                         | Yes – one work has many sections |
| **baseRef** | **Yes**                   | **No** – one ref = one original chunk |

**baseRef** = `ref` with ` (part X/N)` removed. Example: `"a1b2c3d4e5f6g7h8:0/Genesis/1 (part 2/3)"` → baseRef = `"a1b2c3d4e5f6g7h8:0/Genesis/1"`.

**Source:** `ingestTanakhCommentaries.ts` lines 217–220

```ts
const encoded = encodeSectionPath(leaf.sectionPath);
const ref = `${docId}:${encoded}`;  // docId = hash(relPath), encoded = section path
const id = createChunkIdFromRef(ref);
```

- `docId` = first 16 chars of SHA1(relPath) – unique per merged.json file
- `encoded` = section path (e.g. `0/Genesis/1`) – unique per leaf within that file
- So `ref` = `docId:encoded` is unique per original leaf. When that leaf is split, all parts share the same baseRef.

**Conclusion:** `baseRef` (derived from `ref`) is the reliable grouping key. All parts of the same pre-split unit share it; no unrelated parts share it.

---

## 4) Is there a field that identifies the original unsplit semantic unit?

**Yes:** the base part of `ref` (before ` (part X/N)`).

- **`normalizedRef`:** Same as `ref` for split chunks; not a separate identifier.
- **`sectionPath`:** Identifies the section within a file; multiple leaves can share similar paths. Not unique per split unit.
- **`group_id`:** Does not exist.
- **baseRef:** `ref.replace(/\s*\(part \d+\/\d+\)\s*$/, '')` uniquely identifies the original unsplit unit.

---

## 5) Example Qdrant payload for a split chunk

**Source:** Constructed from `splitOversizedChunks.ts`, `ingestTanakhCommentaries.ts`, and `packages/core/src/types.ts`.

**Note:** `ChunkZod.parse()` strips unknown fields. The raw Qdrant payload includes `family`, `sourcePath`, `sectionPath`, but the parsed `Chunk` used in RAG does not. The example below shows the raw payload.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "text": "[~2500 chars of Hebrew commentary text...]",
  "source": "sefaria",
  "type": "tanakh_commentary",
  "work": "Ba'alei Brit Avram",
  "ref": "a1b2c3d4e5f6g7h8:0/Genesis/1 (part 2/3)",
  "normalizedRef": "a1b2c3d4e5f6g7h8:0/Genesis/1 (part 2/3)",
  "lang": "he",
  "createdAt": "2025-02-24T12:00:00.000Z",
  "sourcePath": "Acharonim on Tanakh/Ba'alei Brit Avram/Genesis/Hebrew/merged.json",
  "family": "acharonim",
  "sectionNames": ["Genesis"],
  "sectionPath": [0, "Genesis", 1]
}
```

- **`part_index`:** Not present. Parse from `ref`: `(part 2/3)` → part 2 of 3.
- **`part_count`:** Not present. Parse from `ref`: 3.
- **`text` length:** ~2500 chars (under MAX_EMBED_CHARS 3000).

---

## 6) Is part_index sufficient to reconstruct neighbors reliably?

**No.** `part_index` (parsed from `ref`) is only meaningful within a single baseRef.

- Chunk A: `baseRef1:0/1 (part 1/3)`, `baseRef1:0/1 (part 2/3)`, `baseRef1:0/1 (part 3/3)`
- Chunk B: `baseRef2:0/2 (part 1/2)`, `baseRef2:0/2 (part 2/2)`

Filtering by `family + part_index` would mix parts from different chunks. You must scope by **baseRef**.

**Correct approach:** For a hit with `ref = "X (part 2/3)"`, baseRef = `"X"`. Fetch all points where `ref == "X"` OR `ref` starts with `"X (part "`. That returns exactly the parts of that split unit.

---

## 7) How expensive would it be to query neighbors from Qdrant?

**Indexed payload fields:** `type`, `work`, `source`, `lang` (see `ensureCollection` in `qdrant.ts`). `family`, `sourcePath`, and `ref` are **not** indexed.

**Qdrant filtering:** No native "starts with" for strings. Options:

1. **Scroll + in-memory filter:** Scroll with `type=tanakh_commentary` (and optionally `work` from the hit), then filter `ref.startsWith(baseRef + " ") || ref === baseRef`. Cost scales with collection size.
2. **SQLite for neighbors:** Segments are also in SQLite with `ref` and `normalizedRef`. A query like:
   ```sql
   SELECT * FROM segments
   WHERE type = 'tanakh_commentary'
     AND (ref = @baseRef OR ref LIKE @baseRef || ' (part %')
   ORDER BY ref
   ```
   uses the existing `idx_segments_work_ref` and is efficient. **Recommended** for neighbor expansion without re-ingestion.

---

## Proposed Design: Retrieval-Time Expansion

### Grouping key

**baseRef** = `ref.replace(/\s*\(part \d+\/\d+\)\s*$/, '')`

- Uniquely identifies the original unsplit unit
- All parts of that unit share the same baseRef
- No collisions with other chunks

### Neighbor expansion strategy

1. **Vector search:** Retrieve top-k as today (e.g. k=20).
2. **Detect split parts:** For each hit, parse `ref` with `/\(part (\d+)\/(\d+)\)/`. If it matches, treat as a split part.
3. **Compute baseRef:** `baseRef = ref.replace(/\s*\(part \d+\/\d+\)\s*$/, '')`
4. **Fetch siblings from SQLite:**
   ```sql
   SELECT id, type, work, ref, normalizedRef, textPlain
   FROM segments
   WHERE type = 'tanakh_commentary'
     AND (ref = @baseRef OR ref LIKE @baseRef || ' (part %')
   ORDER BY ref
   ```
   Map `textPlain` → `text` for Chunk shape. **Note:** Do not use `getByPrefix(baseRef)` as-is: `LIKE baseRef || '%'` would incorrectly match e.g. `baseRef` + `0` when you want `baseRef` (e.g. `0/Genesis/1` vs `0/Genesis/10`). Use the explicit `ref = baseRef OR ref LIKE baseRef || ' (part %'` condition. A new `getSegmentsByBaseRef(baseRef)` helper is recommended.
5. **Merge:** Replace the single hit with the full set of siblings, ordered by part number (from ref).
6. **Deduplication:** Group hits by baseRef before expansion. If multiple parts of the same unit are in the top-k, expand once and keep the best score.
7. **Context limit:** Cap total expanded chunks (e.g. max 12 chunks, or max 30k chars) to avoid blowing up the context. Prefer higher-scoring baseRefs.

### Qdrant filter (if used instead of SQLite)

Not recommended: no indexed prefix filter. If SQLite is unavailable, use scroll:

```
filter: { must: [
  { key: "type", match: { value: "tanakh_commentary" } },
  { key: "work", match: { value: hit.work } }  // narrows scope
]}
```
Then filter results in memory by `ref.startsWith(baseRef)`.

### Deduplication

- Before expansion: collect unique baseRefs from split-part hits.
- For each baseRef, expand once.
- If both part 2 and part 3 of the same unit are in top-k, merge them into one unit and use the higher of the two scores for ranking.

### Merge order

Sort siblings by part number: `(part 1/N)`, `(part 2/N)`, …, `(part N/N)`. Concatenate text in that order.

### Limits

- Max expanded units: e.g. 8 (to stay within context).
- Max chars per unit: e.g. 15k (5 parts × 3k).
- Fallback: if expansion returns no rows (e.g. SQLite missing that segment), keep the original single-part hit.
