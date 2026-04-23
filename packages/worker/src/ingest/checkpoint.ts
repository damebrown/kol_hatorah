/**
 * A7 — Checkpoint helpers (extracted from inline per-pipeline code).
 * Checkpoints record which files have been successfully ingested so that
 * a restart resumes where it left off rather than re-ingesting from scratch.
 */

import fs from "fs/promises";
import path from "path";

export type Checkpoint = Record<string, boolean>;

export async function loadCheckpoint(checkpointPath: string): Promise<Checkpoint> {
  const abs = path.resolve(checkpointPath);
  try {
    const data = await fs.readFile(abs, "utf8");
    return JSON.parse(data) as Checkpoint;
  } catch {
    return {};
  }
}

export async function saveCheckpoint(checkpointPath: string, data: Checkpoint): Promise<void> {
  const abs = path.resolve(checkpointPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(data, null, 2));
}
