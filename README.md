1|# kol_hatorah
2|
3|An AI chat that knows all of the Torah - Hebrew RAG project monorepo.
4|
5|## Prerequisites
6|
7|- Node.js >= 20
8|- npm (comes with Node.js)
9|- Qdrant Cloud account and credentials
10|- OpenAI API Key
11|
12|## Setup
13|
14|1. Clone the repository:
15|   ```bash
16|   git clone <repo-url>
17|   cd kol_hatorah
18|   ```
19|
20|2. Install dependencies:
21|   ```bash
22|   npm ci
23|   ```
24|
25|3. Set up environment variables:
26|   ```bash
27|   cp .env.example .env
28|   ```
29|
30|4. Edit `.env` and add your credentials:
31|   - Get your `QDRANT_URL` from your Qdrant Cloud cluster dashboard
32|   - Get your `QDRANT_API_KEY` from your Qdrant Cloud API keys section
33|   - Get your `OPENAI_API_KEY` from the OpenAI platform
34|   - Adjust `QDRANT_COLLECTION_PREFIX` if needed (default: `hebrag_dev`)
35|   - Set `SEFARIA_EXPORT_PATH` to the local path of your Sefaria export data.
   - Optional for Tanakh commentaries ingest: `QDRANT_UPSERT_TIMEOUT_MS` (default 300000), `QDRANT_UPSERT_BATCH_SIZE` (default 32), `QDRANT_UPSERT_CONCURRENCY` (default 6).
36|
37|## Running the Qdrant Smoke Test
38|
39|To verify your Qdrant Cloud connection:
40|
41|```bash
42|npm --workspace packages/worker run qdrant:smoke
43|```
44|
45|This will:
46|- Connect to Qdrant Cloud using your credentials
47|- Create a test collection
48|- Verify it exists
49|- Delete the test collection
50|- Exit with code 0 on success
51|
52|## Stage 3: Real Embeddings, RAG Answering, and Sefaria Ingestion
53|
54|This stage integrates real OpenAI embeddings for ingestion and retrieval, implements RAG-based question answering, and provides tools for inspecting and ingesting Sefaria data.
55|
56|### Ingesting Fake Corpus with Embeddings
57|
58|To ingest a fake Hebrew corpus with real OpenAI embeddings into Qdrant:
59|
60|```bash
61|npm --workspace packages/worker run ingest:fake:emb
62|```
63|
64|This command will:
65|- Ensure the `chunks_v2` collection exists in Qdrant (creates it if missing, throws error on vector size mismatch).
66|- Generate a set of fake Hebrew chunks.
67|- Generate real OpenAI embeddings for each chunk text.
68|- Upsert these chunks and their embeddings into the Qdrant collection, storing the full text and rich metadata in the payload.
69|- Log the number of ingested chunks.
70|
71|### Inspecting Sefaria Export Data
72|
73|To inspect the structure of your local Sefaria export data (useful before full ingestion):
74|
75|```bash
76|npm --workspace packages/worker run sefaria:inspect
77|```
78|
79|This command will:
80|- Read `SEFARIA_EXPORT_PATH`.
81|- Print discovered Sefaria files (e.g., `Genesis.json`).
82|- Parse a small sample from relevant files and print a preview of extracted raw text and metadata.
83|
84|### Ingesting Sefaria Taste Data
85|
86|To ingest a subset of Sefaria data (Genesis 1-3, Avot 1, Berakhot 2a-5a) with real OpenAI embeddings into Qdrant:
87|
88|```bash
89|npm --workspace packages/worker run ingest:sefaria:taste [-- --reset] [-- --limit N]
90|```
91|
92|Arguments:
93|- `--reset`: (Optional) Ignore the checkpoint and re-ingest all data.
94|- `--limit N`: (Optional) Stop after ingesting N chunks (for debugging).
95|
96|This command will:
97|- Extract and chunk Hebrew text from the specified Sefaria subset.
98|- Generate real OpenAI embeddings for each chunk.
99|- Upsert these chunks and embeddings into the `chunks_v2` Qdrant collection.
100|- Support resumable ingestion via a checkpoint file (`.checkpoints/sefaria-taste.json`).
101|
102|### Ingesting Bavli (Gemara) from local Sefaria export
103|
104|```bash
105|npm --workspace packages/worker run ingest:bavli -- --tractates bavli-core
106|```
107|
108|Other examples: `--tractates "Berakhot,Shabbat"`, `--limit 500`, `--no-embed` (SQLite + API enrichment only), `--reset` / `--reset-work Berakhot`, tuning flags `--load-batch-size`, `--api-concurrency`, `--embed-batch-size`, `--qdrant-batch-size`.
109|
110|Hebrew text comes from `json/Talmud/Bavli/.../Hebrew/merged.json`. Segment refs follow Sefaria’s daf-line shape (for example `Berakhot 2a:1`), derived from export indices aligned with `GET /api/texts/{tractate}?index_only=1` (`firstAvailableSectionRef`) and validated with the name API when possible. Metadata and outgoing links are written via existing `segments` enrichment columns and `ref_links`; tractate-level index fields go to `corpus_works`. API errors log warnings and do not stop the run.
111|
112|### Asking Questions with RAG
113|
114|To query the Qdrant collection and get RAG answers using OpenAI:
115|
116|```bash
117|npm --workspace packages/worker run ask -- --q "מה נאמר על ...?" [--k 8] [--type bavli] [--work Berakhot] [--json]
118|```
119|
120|Arguments:
121|- `--q "..."`: The question string (required).
122|- `--k <number>`: Maximum number of retrieved chunks to consider (default: 8 from RAG_TOP_K env var).
123|- `--type <tanakh|mishnah|bavli>`: Filter retrieved chunks by text type.
124|- `--work <string>`: Filter retrieved chunks by work title (e.g., "Genesis", "Berakhot").
125|- `--json`: (Optional) Output the answer and details in structured JSON format.
126|
127|This command will:
128|- Embed the user's question.
129|- Search the `chunks_v2` Qdrant collection with the query embedding and filters.
130|- Determine if a sufficient number of relevant sources are found.
131|- If sufficient: build a Hebrew RAG prompt with the top chunks and call the OpenAI Responses API (gpt-4o-mini).
132|- If insufficient: return a refusal message in Hebrew.
133|- Output the answer and citations (human-readable or JSON).
134|- Report optional latency timings and number of chunks used (in JSON output).
135|
136|## Available Scripts
137|
138|- `npm run build` - Build all packages
139|- `npm run dev` - Run dev mode for all packages
140|- `npm run lint` - Lint all packages
141|- `npm ci` - Clean install dependencies
142|- `npm --workspace packages/worker run qdrant:smoke` - Verify Qdrant Cloud connection
143|- `npm --workspace packages/worker run ingest:fake:emb` - Ingest fake corpus with real embeddings
144|- `npm --workspace packages/worker run sefaria:inspect` - Inspect Sefaria export data
145|- `npm --workspace packages/worker run ingest:sefaria:taste` - Ingest Sefaria taste data
146|- `npm --workspace packages/worker run ingest:bavli` - Ingest Bavli tractates (see “Ingesting Bavli” above)
147|- `npm --workspace packages/worker run ask -- --q "..."` - Ask a RAG question
147|
148|## Project Structure
149|
150|- `packages/core` - Shared libraries (config, Qdrant client, logging, data models, IDs, vectors, OpenAI client, RAG logic, citations, utils)
151|- `packages/worker` - CLI tools and ingestion workers (fake corpus generation, Sefaria ingestion, RAG query)
152|- `packages/web` - Web API server (Express)
153|
154|## Getting Qdrant Cloud Credentials
155|
156|1. Sign up or log in to [Qdrant Cloud](https://cloud.qdrant.io)
157|2. Create a cluster or use an existing one
158|3. In the cluster dashboard, find:
159|   - **URL**: Your cluster endpoint (e.g., `https://xyz-123.qdrant.io`)
160|   - **API Key**: Generate or copy from the API Keys section
161|4. Add these to your `.env` file
162|
163|## Web UI (Chat)

A minimal React UI for querying Kol HaTorah in the browser, with proper RTL support for Hebrew:

```bash
npm install
npm run build   # Build worker first (required for web to import it)
npm run dev     # Starts web API (port 3000) + UI (port 5173)
```

Then open http://localhost:5173 in your browser.

- **POST /api/ask** – API endpoint: `{ "q": "שאילתה", "debug": false }` → `{ "text": "...", "debug?": {...} }`
- **Debug toggle** – When enabled, shows raw JSON from the server in a collapsible section under each response.

## Development
154|
155|Each package can be developed independently:
156|
157|```bash
158|# Build a specific package
159|npm --workspace packages/core run build
160|
161|# Run dev mode for a specific package
162|npm --workspace packages/worker run dev
163|```
