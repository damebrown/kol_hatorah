# kol_hatorah

An AI chat that knows all of the Torah - Hebrew RAG project monorepo.

## Prerequisites

- Node.js >= 20
- npm (comes with Node.js)
- Qdrant Cloud account and credentials

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd kol_hatorah
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Qdrant Cloud credentials:
   - Get your `QDRANT_URL` from your Qdrant Cloud cluster dashboard
   - Get your `QDRANT_API_KEY` from your Qdrant Cloud API keys section
   - Adjust `QDRANT_COLLECTION_PREFIX` if needed (default: `hebrag_dev`)

## Running the Qdrant Smoke Test

To verify your Qdrant Cloud connection:

```bash
npm --workspace packages/worker run qdrant:smoke
```

This will:
- Connect to Qdrant Cloud using your credentials
- Create a test collection
- Verify it exists
- Delete the test collection
- Exit with code 0 on success

## Available Scripts

- `npm run build` - Build all packages
- `npm run dev` - Run dev mode for all packages
- `npm run lint` - Lint all packages
- `npm ci` - Clean install dependencies

## Project Structure

- `packages/core` - Shared libraries (config, Qdrant client, logging)
- `packages/worker` - CLI tools and ingestion workers
- `packages/web` - Web API server (Express)

## Getting Qdrant Cloud Credentials

1. Sign up or log in to [Qdrant Cloud](https://cloud.qdrant.io)
2. Create a cluster or use an existing one
3. In the cluster dashboard, find:
   - **URL**: Your cluster endpoint (e.g., `https://xyz-123.qdrant.io`)
   - **API Key**: Generate or copy from the API Keys section
4. Add these to your `.env` file

## Development

Each package can be developed independently:

```bash
# Build a specific package
npm --workspace packages/core run build

# Run dev mode for a specific package
npm --workspace packages/worker run dev
```
