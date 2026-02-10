import Database from "better-sqlite3";
import fs from "fs/promises";
import path from "path";
import { Chunk } from "@kol-hatorah/core";
import { DEFAULT_SQLITE_PATH } from "./constants";
import { ensureSchema } from "./schema";
import {
  makeInsertSegments,
  makeFindTerm,
  makeCountTerm,
  makeGetByPrefix,
  makeGetRef,
  makeFindTermByWork,
  makeListWorks,
  makeGetSegments,
  makeCountSegments,
  makeSearchByMatch,
} from "./queries";
import { SQLiteManager, ScopeFilter, WorkRow } from "./types";

export async function getSQLiteManager(dbPath: string = DEFAULT_SQLITE_PATH): Promise<SQLiteManager> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  ensureSchema(db);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO segments (id, type, work, ref, normalizedRef, lang, source, textPlain, textNorm)
    VALUES (@id, @type, @work, @ref, @normalizedRef, @lang, @source, @textPlain, @textNorm);
  `);
  const ftsInsertStmt = db.prepare(`
    INSERT OR REPLACE INTO segments_fts(rowid, textNorm) VALUES ((SELECT rowid FROM segments WHERE id=@id), @textNorm);
  `);

  const insertSegments = makeInsertSegments(db, insertStmt, ftsInsertStmt);
  const findTerm = makeFindTerm(db);
  const countTerm = makeCountTerm(db);
  const getByPrefix = makeGetByPrefix(db);
  const getRef = makeGetRef(db);
  const findTermByWork = makeFindTermByWork(db);
  const listWorks = makeListWorks(db);
  const getSegments = makeGetSegments(db);
  const countSegments = makeCountSegments(db);
  const searchByMatch = makeSearchByMatch(db);

  return {
    db,
    insertSegments,
    findTerm,
    countTerm,
    getRef,
    getByPrefix,
    findTermByWork,
    listWorks,
    getSegments,
    countSegments,
    searchByMatch,
    close: () => db.close(),
  };
}

export async function listWorks(dbPath: string = DEFAULT_SQLITE_PATH): Promise<WorkRow[]> {
  const mgr = await getSQLiteManager(dbPath);
  try {
    return mgr.listWorks();
  } finally {
    mgr.close();
  }
}

export type { SQLiteManager, ScopeFilter, WorkRow } from "./types";
