# Implementation Plan Answers

Minimal, production-safe fixes for planner failures. No redesign.

---

## 1️⃣ WORD_OCCURRENCES – Term Extraction Bug

### Where exactly is the term extracted?

**File:** `packages/worker/src/planner/planQuery.ts`  
**Lines:** 51–63

```ts
const occRegex = /(איפה מופיעה|היכן מופיע|היכן כתוב|הבא את כל המופעים|מופיע הביטוי|מופיעה המילה)/;
if (occRegex.test(normalized)) {
  const quoted = normalized.match(/["""'׳''](.+?)["""'׳'']/);
  let term: string | undefined;
  if (quoted) {
    term = quoted[1];
  } else {
    const remainder = normalized.replace(occRegex, "").trim();
    const tokens = remainder.split(/\s+/).filter(Boolean);
    const stopwords = new Set(["המילה", "מילה", "הביטוי", "ביטוי", "מופיעה", "מופיע"]);
    const found = tokens.find((t) => !stopwords.has(t));
    term = found || tokens[0] || remainder;
  }
  // ...
}
```

### Is there a stopword list?

Yes. It is defined inline in the same block:

```ts
const stopwords = new Set(["המילה", "מילה", "הביטוי", "ביטוי", "מופיעה", "מופיע"]);
```

### Does the current logic explicitly handle?

| Pattern | Handled? | How |
|--------|----------|-----|
| `המילה X` | Partially | `המילה` is in stopwords, but extraction uses `tokens.find(t => !stopwords.has(t))` on remainder after removing occRegex. If word order is `איפה בנביאים מופיעה המילה אור`, remainder = `איפה בנביאים אור` → first non-stopword = `איפה` (bug). |
| `הביטוי X` | Same issue | Same logic; `הביטוי` is in stopwords. |
| Quoted `"X"` | Yes | `quoted = normalized.match(/["""'׳''](.+?)["""'׳'']/)` → `term = quoted[1]`. |

### Query: `איפה בנביאים מופיעה המילה אור`

- `occRegex` matches `מופיעה המילה`.
- `remainder = normalized.replace(occRegex, "")` → `"איפה בנביאים אור"`.
- `tokens = ["איפה", "בנביאים", "אור"]`.
- `stopwords` does not include `איפה`, `בנביאים`.
- `found = tokens.find(t => !stopwords.has(t))` → `"איפה"` (first token).
- **Extracted term today:** `"איפה"` (incorrect).

### Minimal change required

1. **If pattern `המילה|הביטוי` exists** → extract the token immediately after it as term.
2. **Question words** → never select as term (add to stopwords or explicit exclusion).

**Suggested implementation:**

```ts
// After checking quoted (unchanged)
// Add explicit extraction for המילה X / הביטוי X
const wordOrPhraseMatch = normalized.match(/(?:המילה|הביטוי|מילה|ביטוי)\s+(\S+)/);
if (wordOrPhraseMatch) {
  term = wordOrPhraseMatch[1].trim();
} else {
  const remainder = normalized.replace(occRegex, "").trim();
  const tokens = remainder.split(/\s+/).filter(Boolean);
  const stopwords = new Set([
    "המילה", "מילה", "הביטוי", "ביטוי", "מופיעה", "מופיע",
    "איפה", "היכן", "באילו", "איזה", "מה", "איך", "מתי", "למה"
  ]);
  const found = tokens.find((t) => !stopwords.has(t));
  term = found || tokens[0] || remainder;
}
```

---

## 2️⃣ QUOTE_ENTITY Coverage Gap

### Exact regex that triggers QUOTE_ENTITY

**File:** `packages/worker/src/planner/planQuery.ts`  
**Line:** 124

```ts
const quoteEntity = normalized.match(/משניות שמזכירות\s+(.+)/);
```

### Why does `באילו משניות במסכת סוטה מופיע רבי עקיבא` NOT match?

The pattern requires **`משניות שמזכירות`** (literally “mishnayot that mention”).  
The query has **`משניות במסכת סוטה מופיע`** (“mishnayot in tractate Sotah appear”).  
The verb is `מופיע` (“appears”), not `שמזכירות` (“that mention”), so the regex does not match.

### What rule currently matches it?

None. It falls through to **GENERAL_QA** (VECTOR_ONLY).

### Expand QUOTE_ENTITY vs new intent ENTITY_OCCURRENCES?

**Recommendation: expand QUOTE_ENTITY.**

- Same semantic goal: “which mishnayot mention entity X?”
- Same execution path: `findTerm(termNorm, scope)` in `executePlan.ts` (lines 138–165).
- Adding ENTITY_OCCURRENCES would duplicate logic and increase maintenance.
- Extending the regex is a small, localized change.

### Minimal regex addition

Add patterns for:

- `באילו משניות ... מופיע X`
- `איפה במשנה ... מוזכר X`
- `רבי מאיר במשנה` (entity + scope)

**Suggested patterns (run before or alongside existing QUOTE_ENTITY):**

```ts
// Existing
const quoteEntity1 = normalized.match(/משניות שמזכירות\s+(.+)/);

// New: באילו משניות [במסכת X] מופיע Y
const quoteEntity2 = normalized.match(/משניות(?:\s+במסכת\s+[^\s]+)?\s+מופיע\s+(.+)/);

// New: איפה במשנה [במסכת X] מוזכר Y
const quoteEntity3 = normalized.match(/(?:איפה|היכן)\s+(?:במשנה|במסכת[^]+?)\s+מוזכר\s+(.+)/);

// New: X במשנה (entity name before "במשנה")
const quoteEntity4 = normalized.match(/(.+?)\s+במשנה(?:\s+במסכת|\s|$)/);
```

**Simpler, safer option:** extend the main pattern to allow `מופיע|מוזכר`:

```ts
const quoteEntity = normalized.match(/משניות(?:\s+במסכת\s+[^\s]+)?\s+(?:שמזכירות|מופיע|מוזכר)\s+(.+)/)
  || normalized.match(/(?:באילו|אילו)\s+משניות(?:\s+במסכת\s+[^\s]+)?\s+מופיע\s+(.+)/);
```

---

## 3️⃣ Chapter Text Retrieval Gap

### Which intent handles `תן לי את פרק ז במשנה במסכת סוטה`?

**None.** It falls through to **GENERAL_QA** (VECTOR_ONLY).

### Why does it fall to GENERAL_QA?

- **EXACT_REF** (`parseRefFromQuery`) requires:
  - Direct: `work chapter:verse`
  - Phrasing: `משנה X בפרק Y במסכת Z` (mishnah number + chapter + work)
- The query asks for **chapter only** (no verse), so it does not match any EXACT_REF pattern.
- **CHAPTER_ABOUT** matches `(?:על מה מדבר|מה הנושא של) פרק X בY` — a different question type.

### Does EXACT_REF support chapter-only Mishnah retrieval?

**No.** `parseRefFromQuery` always returns `{ work, chapter, verse }`; there is no chapter-only branch.

### Safest approach

**Extend EXACT_REF** (or add a dedicated branch that uses the same execution path):

- Reuse `getByPrefix(prefix, scope, limit)` with `prefix = work + " " + chapter + ":"`.
- `buildScopeFilter` already supports `normalizedRefPrefix` when `scope.work` and `scope.chapter` are set.
- **CHAPTER_ABOUT** already uses this pattern (executePlan.ts lines 175–184).

### How to build the SQL query

**Option A: Extend `parseRefFromQuery`** to return chapter-only refs:

```ts
// New pattern: פרק X במשנה במסכת Y / פרק X בY
const chapterOnly = q.match(/פרק\s+([0-9א-ת\"״׳'‎]+)\s+(?:במשנה\s+)?(?:במסכת\s+)?([^\s]+)/);
if (chapterOnly) {
  const ch = parseNumber(chapterOnly[1]);
  const work = resolveWork(chapterOnly[2], registry);
  if (work && ch) {
    return { work, chapter: ch, verse: 0, normalizedRef: `${work} ${ch}:`, rawWork: chapterOnly[2] };
  }
}
```

Then in `executePlan` EXACT_REF, treat `verse === 0` as chapter-only and use `getByPrefix`:

```ts
const prefix = plan.ref?.verse
  ? plan.ref.normalizedRef
  : (plan.ref?.work && plan.ref?.chapter ? `${plan.ref.work} ${plan.ref.chapter}:` : null);
const rows = prefix ? (prefix.includes(":") && !prefix.endsWith(":")
  ? [sqlite.getRef(prefix)].filter(Boolean)
  : sqlite.getByPrefix(prefix, scope, plan.limits.maxResults)) : [];
```

**Option B: New intent GET_CHAPTER_TEXT** in `planQuery.ts`:

```ts
const chapterTextMatch = normalized.match(/תן לי את פרק\s+(\d+)\s+במשנה\s+במסכת\s+([^\s]+)/);
if (chapterTextMatch) {
  const work = resolveScopeNode(chapterTextMatch[2], reg).workName;
  if (work) {
    return {
      intent: QueryIntent.GET_CHAPTER_TEXT, // or reuse EXACT_REF with ref.verse=0
      scope: { work, chapter: parseInt(chapterTextMatch[1], 10) },
      strategy: "SQL_ONLY",
      ...
    };
  }
}
```

Execution would mirror CHAPTER_ABOUT: `prefix = \`${work} ${chapter}:\``, then `getByPrefix(prefix, scope, limit)`.

**No schema changes required.** `getByPrefix` and `buildScopeWhere` already support `normalizedRefPrefix`.

---

## 4️⃣ LLM Guardrails

### Where is the fallback to VECTOR_ONLY happening?

There is **no fallback from SQL_ONLY to VECTOR_ONLY** in `executePlan.ts`.

- `generalQaHandler` is only called when `plan.intent === QueryIntent.GENERAL_QA` (lines 185–189).
- For SQL_ONLY intents (WORD_OCCURRENCES, QUOTE_ENTITY, EXACT_REF, etc.), `executePlan` returns `{ kind: "REFUSAL", message: ... }` when there are 0 results.
- It never invokes `generalQaHandler` in that case.

### Can SQL_ONLY with 0 results still call the LLM?

**No.** For SQL_ONLY intents, 0 results lead directly to REFUSAL; the LLM is not called.

### Where to add a hard guard

If the goal is to standardize the message for SQL_ONLY + 0 results to `"לא נמצא"` and avoid any future LLM fallback, add a guard at the start of each SQL_ONLY branch, or centralize it.

**Exact insertion point:** At the top of `executePlan`, after the disambiguation check:

```ts
// After line 108 (after disambiguation return)
// Add: if SQL_ONLY and we're about to return REFUSAL with 0 results, use "לא נמצא"
```

A cleaner approach is to change the REFUSAL message where 0 results are returned. For example, in the WORD_OCCURRENCES/QUOTE_ENTITY block (lines 153–156):

```ts
if (!rows.length) {
  return { kind: "REFUSAL", message: "לא נמצא" };  // was MESSAGES.REFUSAL_INSUFFICIENT
}
```

**Centralized guard (optional):** If you want a single place that enforces “SQL_ONLY + 0 results → never LLM”:

- After each SQL_ONLY branch that returns REFUSAL, the message is already under your control.
- The only way the LLM would run is if the plan is GENERAL_QA, which is VECTOR_ONLY by design.

So the main change is: **use `"לא נמצא"` instead of `MESSAGES.REFUSAL_INSUFFICIENT`** for SQL_ONLY branches when `rows.length === 0`.

---

## 5️⃣ Testing

### Where are planner tests located?

**File:** `packages/worker/test/queryPlanner.test.ts`  
**Import:** `from "../src/queryPlanner"` (which re-exports `planQuery` from `./planner/planQuery`).

### Do we have unit tests for:

| Intent | Unit test? | Location |
|--------|------------|----------|
| WORD_OCCURRENCES | Yes | `queryPlanner.test.ts` (lines 24–53): quoted, unquoted, scope |
| QUOTE_ENTITY | No | — |
| EXACT_REF | Yes | `queryPlanner.test.ts` (lines 18–21): `בראשית 1:1` |

### Where to add tests

**File:** `packages/worker/test/queryPlanner.test.ts`

**Suggested additions:**

1. **WORD_OCCURRENCES**
   - `איפה בנביאים מופיעה המילה אור` → `term === "אור"` (not `"איפה"`).
   - `המילה X` / `הביטוי X` without quotes → term is X.

2. **QUOTE_ENTITY**
   - `משניות שמזכירות רבי עקיבא` → QUOTE_ENTITY, `term === "רבי עקיבא"`.
   - `באילו משניות במסכת סוטה מופיע רבי עקיבא` → QUOTE_ENTITY (after regex extension).

3. **EXACT_REF**
   - `תן לי את פרק ז במשנה במסכת סוטה` → EXACT_REF or GET_CHAPTER_TEXT (after implementation).
   - Chapter-only retrieval returns correct scope.

---

## Summary of Minimal Changes

| # | Fix | File | Change |
|---|-----|------|--------|
| 1 | WORD_OCCURRENCES term | `planQuery.ts` | Extract term after `המילה|הביטוי`; add question words to stopwords |
| 2 | QUOTE_ENTITY coverage | `planQuery.ts` | Extend regex for `מופיע|מוזכר` and `באילו משניות ... מופיע X` |
| 3 | Chapter text | `parseRefFromQuery.ts` or `planQuery.ts` | Add chapter-only pattern; use `getByPrefix` with `work chapter:` |
| 4 | LLM guardrails | `executePlan.ts` | Use `"לא נמצא"` for SQL_ONLY 0-results REFUSAL |
| 5 | Tests | `queryPlanner.test.ts` | Add cases for 1–3 above |
