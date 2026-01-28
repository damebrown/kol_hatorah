import { createHash } from "crypto";

export const VECTOR_SIZE = 768;

function getHashBytes(text: string): Buffer {
  const hash = createHash("sha256");
  hash.update(text);
  return hash.digest();
}

export function dummyVectorFromText(text: string): number[] {
  const hashBytes = getHashBytes(text);
  const vector: number[] = [];

  for (let i = 0; i < VECTOR_SIZE; i++) {
    const byte = hashBytes[i % hashBytes.length];
    // Map byte (0-255) to a float in [-1, 1]
    vector.push((byte / 127.5) - 1);
  }

  return vector;
}

export function dummyVectorFromQuery(query: string): number[] {
  return dummyVectorFromText(query);
}
