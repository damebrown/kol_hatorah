# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Kol HaTorah** is an AI-powered Hebrew Jewish texts (Torah, Talmud, Mishnah) search and RAG system. It ingests texts from Sefaria JSON exports into Qdrant (vector DB) and SQLite (lexical index), then answers Hebrew queries using multi-stage query planning (LLM intent detection → SQL/vector/hybrid execution → LLM answer generation).

## Monorepo Structure

npm workspaces with four packages:
- **`packages/core`** — shared library: Qdrant client, OpenAI service, config, types, logging, RAG utilities
- **`packages/worker`** — CLI tool: ingestion pipeline, query planner, `askOnce()` entry point
- **`packages/web`** — Express API server (port 3000), exposes `POST /api/ask`
- **`packages/ui`** — React 19 + Vite frontend (port 5173), Hebrew RTL chat UI

## Commands

```bash
# Install
npm ci

# Build all packages
npm run build

# Dev (web API + UI concurrently)
npm run dev
npm run dev:web   # API only, port 3000
npm run dev:ui    # UI only, port 5173

# Lint
npm run lint

# Tests (custom runner, no Jest/Vitest)
npm --workspace packages/worker run test

# Run a single test file
npx tsx packages/worker/test/<filename>.test.ts
npx tsx packages/core/src/text.test.ts

# Query the system
npm --workspace packages/worker run ask -- --q "your Hebrew query here"

# Test Qdrant connection
npm --workspace packages/worker run qdrant:smoke
```

## Testing

Tests use Node's built-in `assert` module and are plain executable `.test.ts` scripts. The test runner (`packages/worker/test/runAll.mjs`) discovers and spawns each file via `tsx`. There is no Jest/Vitest config — do not add Jest-style setup.

To add a test: create a `.test.ts` file in `packages/worker/test/` (or alongside source for core), import `assert` from `node:assert`, and write assertions as top-level `await`-ed calls.

## Architecture: Query Flow

```
UI (React) → POST /api/ask → Web (Express)
  → askOnce() [packages/worker/src/askOnce.ts]
    → planQueryWithLLMRouter()   [src/planner/llmRouter.ts]  — LLM classifies intent
    → executePlan()              [src/planner/executePlan.ts] — SQL / Qdrant / hybrid
    → renderResult()             [src/planner/renderResult.ts]
    → RAG prompt + LLM answer
```

**QueryIntent enum** (in `packages/worker/src/planner/types.ts`):
`EXACT_REF`, `WORD_OCCURRENCES`, `CHAPTER_ABOUT`, `QUOTE_ENTITY`, `QUOTE_QUERY`, `FIND_REFERENCES`, `LIST_WORKS_MENTIONING_ENTITY`, `CORPUS_QUOTE_QUERY`, `GENERAL_QA`

Each intent maps to a strategy: `SQL_ONLY`, `VECTOR_ONLY`, or `HYBRID_SQL_THEN_LLM`.

## Architecture: Ingestion Pipeline

Sefaria JSON exports → `packages/worker/src/ingest/` → embeddings (OpenAI) → Qdrant + SQLite

Key ingest commands:
```bash
npm --workspace packages/worker run ingest:tanakh
npm --workspace packages/worker run ingest:mishnah
npm --workspace packages/worker run ingest:bavli
npm --workspace packages/worker run ingest:corpora
npm --workspace packages/worker run ingest:tanakh-commentaries
```

Bavli ingestion is the most complex: `loadMergedLeaves.ts` parses Sefaria `merged.json`, `refs.ts` handles daf:line format, and `enrichSefariaMergedSegment.ts` augments with graph-augmented metadata.

## Core Data Types

**`Chunk`** (in `packages/core/src/types.ts`) — the unit stored in Qdrant:
- `type: TextType` — `"tanakh" | "mishnah" | "bavli" | "tanakh_commentary" | ...`
- `ref` / `normalizedRef` — e.g., `"בראשית א:א"`
- `work`, `text`, `lang`, `source`, `versionTitle`, `sefariaUrl`

**`QueryPlan`** (in `packages/worker/src/planner/types.ts`) — output of `planQuery()`:
- `intent`, `scope` (work/corpus filters), `term`, `ref`, `strategy`, `limits`

## Environment

Copy `.env.example` to `.env`. Required variables:
```
QDRANT_URL=
QDRANT_API_KEY=
QDRANT_COLLECTION_PREFIX=hebrag_dev
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
SEFARIA_EXPORT_PATH=/path/to/Sefaria-Export-master
```

Optional: `SQLITE_PATH` (default: `packages/worker/.local/hebrag_lexical.sqlite`), `LOG_LEVEL`, `RAG_TOP_K`, `RAG_MIN_SOURCES`.

## TypeScript Config

`tsconfig.base.json` enforces strict mode, ES2022 target, CommonJS modules. All packages extend this base. ESLint warns on `any` and unused variables — treat these as errors in new code.

## Logging

Uses `pino` (configured in `packages/core/src/log.ts`). Follow the two-tier logging rule from the global CLAUDE.md: DEBUG for flow tracing, INFO for operational checkpoints.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on Node 20: `npm ci && npm run build && npm run lint`. There is no CI test step — tests require live Qdrant/OpenAI credentials.
