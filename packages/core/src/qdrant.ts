import { QdrantClient } from "@qdrant/js-client-rest";
import { Chunk, ChunkZod, TextType } from "./types";
import { VECTOR_SIZE } from "./vectors"; // Keep for dummy, but new ensureCollection uses dynamic size
import { setTimeout } from "timers/promises";

export interface QdrantClientOptions {
  url: string;
  apiKey: string;
}

export interface CreateCollectionOptions {
  name: string;
  vectorSize: number;
  distance?: "Cosine" | "Euclid" | "Dot";
}

export function createQdrantClient(options: QdrantClientOptions): QdrantClient {
  return new QdrantClient({
    url: options.url,
    apiKey: options.apiKey,
    // Suppress server version check warning
    checkCompatibility: false,
  });
}

export async function listCollections(client: QdrantClient): Promise<string[]> {
  const collections = await client.getCollections();
  return collections.collections.map((c) => c.name);
}

export async function createCollection(
  client: QdrantClient,
  options: CreateCollectionOptions
): Promise<void> {
  await client.createCollection(options.name, {
    vectors: {
      size: options.vectorSize,
      distance: options.distance || "Cosine",
    },
  });
}

export async function deleteCollection(client: QdrantClient, name: string): Promise<void> {
  await client.deleteCollection(name);
}

export async function collectionExists(client: QdrantClient, name: string): Promise<boolean> {
  try {
    await client.getCollection(name);
    return true;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error) {
      const status = error.status as number;
      if (status === 404) {
        return false;
      }
    }
    throw error;
  }
}

async function areIndexesReady(client: QdrantClient, collectionName: string): Promise<boolean> {
  try {
    const collectionInfo = await client.getCollection(collectionName);
    const payloadSchema = collectionInfo.payload_schema || {};

    const requiredIndexes = ["type", "work", "source", "lang"];
    let allReady = true;
    for (const indexName of requiredIndexes) {
      const index = (payloadSchema as any)[indexName];
      if (!index || index.data_type !== "keyword") {
        // console.log(`Index for '${indexName}' not ready or incorrect type. Current: ${JSON.stringify(index)}`);
        allReady = false;
      }
    }
    return allReady;
  } catch (error) {
    console.error("Error checking index readiness:", error);
    return false;
  }
}

export async function ensureCollection(
  client: QdrantClient,
  collectionName: string,
  vectorSize: number,
  distance: "Cosine" | "Euclid" | "Dot" = "Cosine"
): Promise<void> {
  const exists = await collectionExists(client, collectionName);
  if (exists) {
    const collectionInfo = await client.getCollection(collectionName);
    const currentVectorSize = (collectionInfo.config as any)?.params?.vectors?.size;

    if (currentVectorSize !== vectorSize) {
      throw new Error(
        `Collection '${collectionName}' already exists with a different vector size (` +
          `${currentVectorSize} instead of ${vectorSize}). Please delete the collection manually ` +
          `or use a different collection name.`
      );
    }
    console.log(`Collection '${collectionName}' already exists and has matching vector size.`);
  } else {
    console.log(`Creating collection ${collectionName} with vector size ${vectorSize}...`);
    await createCollection(client, {
      name: collectionName,
      vectorSize,
      distance,
    });
    console.log(`Collection ${collectionName} created.`);

    // Create indexes for filtering
    console.log(`Creating payload index for 'type' in ${collectionName}...`);
    await client.createPayloadIndex(collectionName, {
      field_name: "type",
      field_schema: "keyword",
    });
    console.log(`Payload index for 'type' created.`);

    console.log(`Creating payload index for 'work' in ${collectionName}...`);
    await client.createPayloadIndex(collectionName, {
      field_name: "work",
      field_schema: "keyword",
    });
    console.log(`Payload index for 'work' created.`);

    console.log(`Creating payload index for 'source' in ${collectionName}...`);
    await client.createPayloadIndex(collectionName, {
      field_name: "source",
      field_schema: "keyword",
    });
    console.log(`Payload index for 'source' created.`);

    console.log(`Creating payload index for 'lang' in ${collectionName}...`);
    await client.createPayloadIndex(collectionName, {
      field_name: "lang",
      field_schema: "keyword",
    });
    console.log(`Payload index for 'lang' created.`);

    // Poll until indexes are ready
    const maxAttempts = 10;
    const retryDelayMs = 2000; // 2 seconds
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Checking index readiness (Attempt ${attempt}/${maxAttempts})...`);
      if (await areIndexesReady(client, collectionName)) {
        console.log("All required indexes are ready.");
        return;
      }
      await setTimeout(retryDelayMs);
    }
    throw new Error("Qdrant indexes did not become ready within the expected time.");
  }
}

export async function upsertChunksWithVectors(
  client: QdrantClient,
  collectionName: string,
  chunks: Chunk[],
  vectors: number[][]
): Promise<void> {
  if (chunks.length !== vectors.length) {
    throw new Error("Number of chunks and vectors must be equal.");
  }

  const points = chunks.map((chunk, index) => ({
    id: chunk.id,
    vector: vectors[index],
    payload: chunk,
  }));

  await client.upsert(collectionName, {
    wait: true,
    batch: {
      ids: points.map((p) => p.id),
      vectors: points.map((p) => p.vector),
      payloads: points.map((p) => p.payload),
    },
  });
}

export async function searchByVector(
  client: QdrantClient,
  collectionName: string,
  queryVector: number[],
  opts: { limit: number; type?: TextType; work?: string; source?: string; lang?: string }
): Promise<Array<{ score: number; chunk: Chunk }>> {
  const { limit, type, work, source, lang } = opts;

  const filter: any = { must: [] };

  if (type) {
    filter.must.push({ key: "type", match: { value: type } });
  }
  if (work) {
    filter.must.push({ key: "work", match: { value: work } });
  }
  if (source) {
    filter.must.push({ key: "source", match: { value: source } });
  }
  if (lang) {
    filter.must.push({ key: "lang", match: { value: lang } });
  }

  const searchResult = await client.search(collectionName, {
    vector: queryVector,
    limit,
    filter: filter.must.length > 0 ? filter : undefined,
    with_payload: true,
  });

  return searchResult.map((result) => ({
    score: result.score,
    chunk: ChunkZod.parse(result.payload),
  }));
}
