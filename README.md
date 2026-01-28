1|# kol_hatorah
2|
3|An AI chat that knows all of the Torah - Hebrew RAG project monorepo.
4|
5|## Prerequisites
6|
7|- Node.js >= 20
8|- npm (comes with Node.js)
9|- Qdrant Cloud account and credentials
10|
11|## Setup
12|
13|1. Clone the repository:
14|   ```bash
15|   git clone <repo-url>
16|   cd kol_hatorah
17|   ```
18|
19|2. Install dependencies:
20|   ```bash
21|   npm ci
22|   ```
23|
24|3. Set up environment variables:
25|   ```bash
26|   cp .env.example .env
27|   ```
28|
29|4. Edit `.env` and add your Qdrant Cloud credentials:
30|   - Get your `QDRANT_URL` from your Qdrant Cloud cluster dashboard
31|   - Get your `QDRANT_API_KEY` from your Qdrant Cloud API keys section
32|   - Adjust `QDRANT_COLLECTION_PREFIX` if needed (default: `hebrag_dev`)
33|
34|## Running the Qdrant Smoke Test
35|
36|To verify your Qdrant Cloud connection:
37|
38|```bash
39|npm --workspace packages/worker run qdrant:smoke
40|```
41|
42|This will:
43|- Connect to Qdrant Cloud using your credentials
44|- Create a test collection
45|- Verify it exists
46|- Delete the test collection
47|- Exit with code 0 on success
48|
49|## Stage 2: Data Model, Ingestion, and Retrieval
50|
51|This stage implements a rich `Chunk` data model, ingests a fake Hebrew corpus into Qdrant, and provides CLI commands for ingestion and retrieval.
52|
53|### Ingesting Fake Corpus
54|
55|To ingest the fake Hebrew corpus into Qdrant:
56|
57|```bash
58|npm --workspace packages/worker run ingest:fake
59|```
60|
61|This command will:
62|- Ensure the `chunks_v1` collection exists in Qdrant (creates it if missing).
63|- Generate a set of fake Hebrew chunks with stable, deterministic IDs.
64|- Upsert these chunks into the Qdrant collection, storing the full text and rich metadata in the payload.
65|- Log the number of ingested chunks.
66|
67|### Retrieving Chunks
68|
69|To query the Qdrant collection and retrieve chunks:
70|
71|```bash
72|npm --workspace packages/worker run ask:retrieve -- --q "מה נאמר על ...?" --limit 8 --type bavli --work Berakhot
73|```
74|
75|Arguments:
76|- `--q "..."`: The query string (required).
77|- `--limit <number>`: Maximum number of results to return (default: 8).
78|- `--type <tanakh|mishnah|bavli>`: Filter by text type.
79|- `--work <string>`: Filter by work title (e.g., "Genesis", "Berakhot").
80|
81|This command will:
82|- Create a deterministic dummy vector from your query string.
83|- Search the `chunks_v1` collection in Qdrant.
84|- Apply filters based on `type`, `work`, and `source` (defaulting `lang` to "he").
85|- Print the top-k results, including rank, score, type/work/ref, and a short text preview.
86|
87|### Implementation Details
88|
89|For this stage, dummy/deterministic vectors are used for both ingestion and retrieval. Real embedding API calls will be integrated in a later stage to keep costs low during development.
90|
91|## Available Scripts
92|
93|- `npm run build` - Build all packages
94|- `npm run dev` - Run dev mode for all packages
95|- `npm run lint` - Lint all packages
96|- `npm ci` - Clean install dependencies
97|
98|## Project Structure
99|
100|- `packages/core` - Shared libraries (config, Qdrant client, logging, data models, IDs, vectors)
101|- `packages/worker` - CLI tools and ingestion workers (fake corpus generation)
102|- `packages/web` - Web API server (Express)
103|
104|## Getting Qdrant Cloud Credentials
105|
106|1. Sign up or log in to [Qdrant Cloud](https://cloud.qdrant.io)
107|2. Create a cluster or use an existing one
108|3. In the cluster dashboard, find:
109|   - **URL**: Your cluster endpoint (e.g., `https://xyz-123.qdrant.io`)
110|   - **API Key**: Generate or copy from the API Keys section
111|4. Add these to your `.env` file
112|
113|## Development
114|
115|Each package can be developed independently:
116|
117|```bash
118|# Build a specific package
119|npm --workspace packages/core run build
120|
121|# Run dev mode for a specific package
122|npm --workspace packages/worker run dev
123|```
