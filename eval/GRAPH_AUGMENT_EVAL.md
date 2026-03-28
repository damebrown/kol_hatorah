# Graph-augmented retrieval evaluation

## What it does

Runs the same **12 Hebrew questions** through the normal RAG `askOnce` path twice per question:

1. With `KOL_HATORAH_ENABLE_SEFARIA_GRAPH=0` (baseline)
2. With `KOL_HATORAH_ENABLE_SEFARIA_GRAPH=1` (graph rerank + expansion)

It writes a markdown report comparing answers, context pools, and graph internals.

Eval calls `askOnce` with **`forceRag: true`** so questions that contain lexical shortcuts (e.g. “מופיע”) still go through **vector RAG**, matching what this harness is meant to measure.

## Prerequisites

- Qdrant + SQLite corpus configured as for normal `ask`
- OpenAI keys for embed + chat (24 LLM calls per full run)
- Network for Sefaria when graph mode is on

## How to run

From the **repository root**:

```bash
npm --workspace packages/worker run eval:graph-augment
```

Optional:

```bash
npx tsx packages/worker/src/cli.ts eval-graph-augment --out ./eval/my_report.md --k 12
```

Default report path: `eval/graph_augmented_retrieval_report.md` (repo root).

## Debug data captured (eval only)

When `askOnce` is called with `evalCapture: true` on the **vector RAG path**, `retrievalEval` is attached to the result:

| Field | Meaning |
|--------|--------|
| `vectorTopK` | Raw Qdrant hits (ref, work, type, score) |
| `afterExpandSplitChunks` | After `expandSplitChunks`, before graph |
| `graphAugmentation` | Full graph debug when flag on (signals, rerank, neighbors, unmapped) |
| `contextPool` | Final ordered pool before `shouldAnswer` / `buildRagPrompt` |

Normal CLI `ask` does **not** set `evalCapture`; production behavior is unchanged.

## Files touched

- `packages/worker/src/cli/commands/ask.ts` — optional `retrievalEval` snapshot
- `packages/worker/src/eval/graphAugmentEval.ts` — runner, heuristics, report body
- `packages/worker/src/cli/commands/evalGraphAugment.ts` — CLI entry
- `packages/worker/src/cli/index.ts` — command registration
- `packages/worker/package.json` — `eval:graph-augment` script
- `eval/GRAPH_AUGMENT_EVAL.md` — this file
- `eval/graph_augmented_retrieval_report.md` — **generated** by the runner (not committed by default)

## Heuristic labels

Labels (`likely improved` / `no clear change` / `possible degradation`) are **rule-based** only; see `heuristicLabelForPair` in `graphAugmentEval.ts`.
