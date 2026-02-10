import { listWorks } from "../../storage/sqlite";
import { WorkRegistry } from "../types";

let registryCache: WorkRegistry | null = null;

export async function ensureRegistry(): Promise<WorkRegistry> {
  if (registryCache) return registryCache;
  const rows = await listWorks();
  const reg: WorkRegistry = new Map();
  for (const r of rows) {
    if (!reg.has(r.type)) reg.set(r.type, new Set());
    reg.get(r.type)!.add(r.work);
  }
  registryCache = reg;
  return reg;
}

export function setRegistryCache(registry: WorkRegistry | null) {
  registryCache = registry;
}

export function getRegistryCache(): WorkRegistry | null {
  return registryCache;
}
