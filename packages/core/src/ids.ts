import { createHash, randomUUID } from "crypto";

interface CreateChunkIdArgs {
  source: string;
  ref: string;
  lang: string;
  text: string;
}

export function createChunkId(args: CreateChunkIdArgs): string {
  const { source, ref, lang, text } = args;
  const hash = createHash("sha1");
  hash.update(`${source}|${ref}|${lang}|${text}`);
  const sha1Hash = hash.digest("hex");

  // Convert a portion of the SHA-1 hash to a deterministic UUID v4
  // A UUID v4 is 128 bits (16 bytes). SHA-1 produces 160 bits (20 bytes).
  // We'll use the first 16 bytes of the SHA-1 hash.
  const bytes = Buffer.from(sha1Hash.substring(0, 32), "hex"); // Get first 16 bytes (32 hex chars)

  // Set UUID version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  return [
    bytes.subarray(0, 4).toString("hex"),
    bytes.subarray(4, 6).toString("hex"),
    bytes.subarray(6, 8).toString("hex"),
    bytes.subarray(8, 10).toString("hex"),
    bytes.subarray(10, 16).toString("hex"),
  ].join("-");
}
