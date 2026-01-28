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
102|### Asking Questions with RAG
103|
104|To query the Qdrant collection and get RAG answers using OpenAI:
105|
106|```bash
107|npm --workspace packages/worker run ask -- --q "מה נאמר על ...?" [--k 8] [--type bavli] [--work Berakhot] [--json]
108|```
109|
110|Arguments:
111|- `--q "..."`: The question string (required).
112|- `--k <number>`: Maximum number of retrieved chunks to consider (default: 8 from RAG_TOP_K env var).
113|- `--type <tanakh|mishnah|bavli>`: Filter retrieved chunks by text type.
114|- `--work <string>`: Filter retrieved chunks by work title (e.g., "Genesis", "Berakhot").
115|- `--json`: (Optional) Output the answer and details in structured JSON format.
116|
117|This command will:
118|- Embed the user's question.
119|- Search the `chunks_v2` Qdrant collection with the query embedding and filters.
120|- Determine if a sufficient number of relevant sources are found.
121|- If sufficient: build a Hebrew RAG prompt with the top chunks and call the OpenAI Responses API (gpt-4o-mini).
122|- If insufficient: return a refusal message in Hebrew.
123|- Output the answer and citations (human-readable or JSON).
124|- Report optional latency timings and number of chunks used (in JSON output).
125|
126|## Available Scripts
127|
128|- `npm run build` - Build all packages
129|- `npm run dev` - Run dev mode for all packages
130|- `npm run lint` - Lint all packages
131|- `npm ci` - Clean install dependencies
132|- `npm --workspace packages/worker run qdrant:smoke` - Verify Qdrant Cloud connection
133|- `npm --workspace packages/worker run ingest:fake:emb` - Ingest fake corpus with real embeddings
134|- `npm --workspace packages/worker run sefaria:inspect` - Inspect Sefaria export data
135|- `npm --workspace packages/worker run ingest:sefaria:taste` - Ingest Sefaria taste data
136|- `npm --workspace packages/worker run ask -- --q "..."` - Ask a RAG question
137|
138|## Project Structure
139|
140|- `packages/core` - Shared libraries (config, Qdrant client, logging, data models, IDs, vectors, OpenAI client, RAG logic, citations, utils)
141|- `packages/worker` - CLI tools and ingestion workers (fake corpus generation, Sefaria ingestion, RAG query)
142|- `packages/web` - Web API server (Express)
143|
144|## Getting Qdrant Cloud Credentials
145|
146|1. Sign up or log in to [Qdrant Cloud](https://cloud.qdrant.io)
147|2. Create a cluster or use an existing one
148|3. In the cluster dashboard, find:
149|   - **URL**: Your cluster endpoint (e.g., `https://xyz-123.qdrant.io`)
150|   - **API Key**: Generate or copy from the API Keys section
151|4. Add these to your `.env` file
152|
153|## Development
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
