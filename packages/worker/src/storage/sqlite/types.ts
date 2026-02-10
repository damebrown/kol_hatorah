import Database from "better-sqlite3";
import { Chunk } from "@kol-hatorah/core";

export interface ScopeFilter {
  type?: string;
  work?: string;
  workIn?: string[];
  normalizedRefPrefix?: string;
}

export interface WorkRow {
  type: string;
  work: string;
  count: number;
}

export interface SQLiteManager {
  db: Database.Database;
  insertSegments: (segments: Chunk[]) => void;
  findTerm: (termNorm: string, scope?: ScopeFilter, limit?: number) => Array<any>;
  getRef: (normalizedRef: string) => any | null;
  countTerm: (termNorm: string, scope?: ScopeFilter) => number;
  getByPrefix: (prefix: string, scope?: ScopeFilter, limit?: number) => Array<any>;
  findTermByWork: (termNorm: string, scope?: ScopeFilter, limit?: number) => Array<{ work: string; count: number }>;
  listWorks: () => WorkRow[];
  close: () => void;
}
