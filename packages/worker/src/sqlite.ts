import Database from "better-sqlite3";
import fs from "fs/promises";
import path from "path";
import { Chunk, normalizeText } from "@kol-hatorah/core";

const DEFAULT_SQLITE_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "packages/worker/.local/hebrag_lexical.sqlite");

export interface SQLiteManager {
  db: Database.Database;
  insertSegments: (segments: Chunk[]) => void;
  findTerm: (termNorm: string, scope?: { type?: string; work?: string }, limit?: number) => Array<any>;
  getRef: (normalizedRef: string) => any | null;
  countTerm: (termNorm: string, scope?: { type?: string; work?: string }) => number;
  close: () => void;
}

export async function getSQLiteManager(dbPath: string = DEFAULT_SQLITE_PATH): Promise<SQLiteManager> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      type TEXT,
      work TEXT,
      ref TEXT,
      normalizedRef TEXT,
      lang TEXT,
      source TEXT,
      textPlain TEXT,
      textNorm TEXT
    );
  `);

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS segments_fts USING fts5(
      textNorm,
      content='segments',
      content_rowid='rowid'
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_segments_type_work ON segments(type, work);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_segments_work_ref ON segments(work, ref);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_segments_normref ON segments(normalizedRef);`);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO segments (id, type, work, ref, normalizedRef, lang, source, textPlain, textNorm)
    VALUES (@id, @type, @work, @ref, @normalizedRef, @lang, @source, @textPlain, @textNorm);
  `);
  const ftsInsertStmt = db.prepare(`
    INSERT OR REPLACE INTO segments_fts(rowid, textNorm) VALUES ((SELECT rowid FROM segments WHERE id=@id), @textNorm);
  `);

  const insertSegments = (segments: Chunk[]) => {
    const batch = db.transaction((rows: Chunk[]) => {
      for (const c of rows) {
        const norm = normalizeText(c.text);
        insertStmt.run({
          id: c.id,
          type: c.type,
          work: c.work,
          ref: c.ref,
          normalizedRef: c.normalizedRef,
          lang: c.lang,
          source: c.source,
          textPlain: norm.textPlain,
          textNorm: norm.textNorm,
        });
        ftsInsertStmt.run({ id: c.id, textNorm: norm.textNorm });
      }
    });
    batch(segments);
  };

  const buildScopeWhere = (scope?: { type?: string; work?: string }) => {
    const clauses: string[] = [];
    const params: any = {};
    if (scope?.type) {
      clauses.push("type = @type");
      params.type = scope.type;
    }
    if (scope?.work) {
      clauses.push("work = @work");
      params.work = scope.work;
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return { where, params };
  };

  const findTerm = (termNorm: string, scope?: { type?: string; work?: string }, limit = 50) => {
    const { where, params } = buildScopeWhere(scope);
    const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${where}
      LIMIT @limit;
    `);
    return stmt.all({ match: termNorm, limit, ...params });
  };

  const countTerm = (termNorm: string, scope?: { type?: string; work?: string }) => {
    const { where, params } = buildScopeWhere(scope);
    const stmt = db.prepare(`
      SELECT COUNT(*) as cnt
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${where};
    `);
    const row = stmt.get({ match: termNorm, ...params }) as any;
    return row?.cnt || 0;
  };

  const getRef = (normalizedRef: string) => {
    const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      WHERE normalizedRef = @normalizedRef
      LIMIT 1;
    `);
    return stmt.get({ normalizedRef });
  };

  return {
    db,
    insertSegments,
    findTerm,
    countTerm,
    getRef,
    close: () => db.close(),
  };
}
