import Database from "better-sqlite3";
import { normalizeText } from "@kol-hatorah/core";
import { ScopeFilter, WorkRow } from "./types";

export const buildScopeWhere = (scope?: ScopeFilter) => {
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
  if (scope?.workIn && scope.workIn.length > 0) {
    const placeholders = scope.workIn.map((_, idx) => `@workIn${idx}`).join(", ");
    clauses.push(`work IN (${placeholders})`);
    scope.workIn.forEach((w, idx) => {
      params[`workIn${idx}`] = w;
    });
  }
  if (scope?.normalizedRefPrefix) {
    clauses.push("normalizedRef LIKE @normalizedRefPrefix || '%'");
    params.normalizedRefPrefix = scope.normalizedRefPrefix;
  }
  const clause = clauses.length ? clauses.join(" AND ") : "";
  return { clause, params };
};

export const expandTermForPrefixes = (term: string) => {
  const prefixes = ["", "ו", "ב", "כ", "ל", "מ", "ה"];
  const variants = prefixes.map((p) => `${p}${term}`);
  return variants.map((v) => `${v}*`).join(" OR ");
};

export const makeInsertSegments =
  (db: Database.Database, insertStmt: Database.Statement, ftsInsertStmt: Database.Statement) => (segments: any[]) => {
    const batch = db.transaction((rows: any[]) => {
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

export const makeFindTerm = (db: Database.Database) => (termNorm: string, scope?: ScopeFilter, limit = 50) => {
  const { clause, params } = buildScopeWhere(scope);
  const andClause = clause ? `AND ${clause}` : "";
  const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${andClause}
      LIMIT @limit;
    `);
  const match = expandTermForPrefixes(termNorm);
  return stmt.all({ match, limit, ...params });
};

export const makeCountTerm = (db: Database.Database) => (termNorm: string, scope?: ScopeFilter) => {
  const { clause, params } = buildScopeWhere(scope);
  const andClause = clause ? `AND ${clause}` : "";
  const stmt = db.prepare(`
      SELECT COUNT(*) as cnt
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${andClause};
    `);
  const match = expandTermForPrefixes(termNorm);
  const row = stmt.get({ match, ...params }) as any;
  return row?.cnt || 0;
};

export const makeGetByPrefix = (db: Database.Database) => (prefix: string, scope?: ScopeFilter, limit = 500) => {
  const { clause, params } = buildScopeWhere({ ...scope, normalizedRefPrefix: prefix });
  const where = clause ? `WHERE ${clause}` : "";
  const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      ${where}
      ORDER BY ref
      LIMIT @limit;
    `);
  return stmt.all({ limit, ...params });
};

export const makeGetRef = (db: Database.Database) => (normalizedRef: string) => {
  const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      WHERE normalizedRef = @normalizedRef
      LIMIT 1;
    `);
  return stmt.get({ normalizedRef });
};

export const makeFindTermByWork = (db: Database.Database) => (termNorm: string, scope?: ScopeFilter, limit = 100) => {
  const { clause, params } = buildScopeWhere(scope);
  const where = clause ? `AND ${clause}` : "";
  const stmt = db.prepare(`
      SELECT work, COUNT(*) as cnt
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${where}
      GROUP BY work
      ORDER BY cnt DESC
      LIMIT @limit;
    `);
  const match = expandTermForPrefixes(termNorm);
  return stmt.all({ match, limit, ...params }).map((r: any) => ({ work: r.work, count: Number(r.cnt) }));
};

export const makeListWorks = (db: Database.Database) => (): WorkRow[] => {
  const stmt = db.prepare(`
      SELECT type, work, COUNT(*) as count
      FROM segments
      GROUP BY type, work;
    `);
  return stmt.all().map((r: any) => ({ type: r.type, work: r.work, count: Number(r.count) }));
};
