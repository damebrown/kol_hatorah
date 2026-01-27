import { QdrantClient } from "@qdrant/js-client-rest";

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
