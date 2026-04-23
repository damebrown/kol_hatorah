import Database from "better-sqlite3";
import { normalizeText } from "@kol-hatorah/core";
import {
  CorpusWorkRow,
  EnrichmentSegmentRow,
  RefLinkRow,
  ScopeFilter,
  SegmentEnrichmentUpdate,
  TanakhCommentaryGraphRow,
  TanakhCommentaryGraphUpdate,
  WorkRow,
} from "./types";

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

export const makeFindTerm =
  (db: Database.Database) =>
  (termNorm: string, scope?: ScopeFilter, limit = 50, offset = 0) => {
  const { clause, params } = buildScopeWhere(scope);
  const andClause = clause ? `AND ${clause}` : "";
  const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      WHERE rowid IN (
        SELECT rowid FROM segments_fts WHERE segments_fts MATCH @match
      )
      ${andClause}
      LIMIT @limit OFFSET @offset;
    `);
  const match = expandTermForPrefixes(termNorm);
  return stmt.all({ match, limit, offset, ...params });
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
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain, sefariaCanonicalRef
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

export const makeGetSegments = (db: Database.Database) => (scope?: ScopeFilter, limit = 200, offset = 0) => {
  const { clause, params } = buildScopeWhere(scope);
  const where = clause ? `WHERE ${clause}` : "";
  const stmt = db.prepare(`
      SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
      FROM segments
      ${where}
      ORDER BY work, ref
      LIMIT @limit OFFSET @offset;
    `);
  return stmt.all({ limit, offset, ...params });
};

export const makeCountSegments = (db: Database.Database) => (scope?: ScopeFilter) => {
  const { clause, params } = buildScopeWhere(scope);
  const where = clause ? `WHERE ${clause}` : "";
  const stmt = db.prepare(`
      SELECT COUNT(*) as cnt
      FROM segments
      ${where};
    `);
  const row = stmt.get({ ...params }) as any;
  return Number(row?.cnt || 0);
};

export const makeDeleteSegmentsByTypeAndLang =
  (db: Database.Database) => (type: string, lang: string): number => {
    return db.transaction(() => {
      const sel = db.prepare(`SELECT rowid FROM segments WHERE type = @type AND lang = @lang`);
      const rowids = sel.all({ type, lang }) as { rowid: number }[];
      if (rowids.length === 0) return 0;
      const ids = rowids.map((r) => r.rowid);
      const placeholders = ids.map(() => "?").join(",");
      db.prepare(`DELETE FROM segments_fts WHERE rowid IN (${placeholders})`).run(...ids);
      const del = db.prepare(`DELETE FROM segments WHERE type = @type AND lang = @lang`);
      return (del.run({ type, lang }) as { changes: number }).changes;
    })();
  };

export const makeGetSegmentsByBaseRef = (db: Database.Database) => (baseRef: string, type: string) => {
  const stmt = db.prepare(`
    SELECT id, type, work, ref, normalizedRef, lang, source, textPlain
    FROM segments
    WHERE type = @type
      AND (ref = @baseRef OR ref LIKE @partPrefix)
    ORDER BY ref
  `);
  const partPrefix = baseRef + " (part %";
  return stmt.all({ type, baseRef, partPrefix });
};

export const makeSearchByMatch = (db: Database.Database) => (match: string, scope?: ScopeFilter, limit = 20) => {
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
  return stmt.all({ match, limit, ...params });
};

export const makeListSegmentsForEnrichment =
  (db: Database.Database) =>
  (opts: { types: string[]; resumeOnly: boolean; afterRowid: number; limit: number }): EnrichmentSegmentRow[] => {
    if (opts.types.length === 0) return [];
    const inList = opts.types.map(() => "?").join(", ");
    const resumeClause = opts.resumeOnly ? "AND enrichedAt IS NULL" : "";
    const stmt = db.prepare(`
      SELECT rowid AS rowid, id, type, work, ref, normalizedRef, lang, source
      FROM segments
      WHERE type IN (${inList})
      ${resumeClause}
      AND rowid > ?
      ORDER BY rowid
      LIMIT ?
    `);
    return stmt.all(...opts.types, opts.afterRowid, opts.limit) as EnrichmentSegmentRow[];
  };

export const makeCountSegmentsForEnrichment =
  (db: Database.Database) =>
  (opts: { types: string[]; resumeOnly: boolean }): number => {
    if (opts.types.length === 0) return 0;
    const inList = opts.types.map(() => "?").join(", ");
    const resumeClause = opts.resumeOnly ? "AND enrichedAt IS NULL" : "";
    const stmt = db.prepare(`
      SELECT COUNT(*) AS cnt
      FROM segments
      WHERE type IN (${inList})
      ${resumeClause}
    `);
    const row = stmt.get(...opts.types) as { cnt: number };
    return Number(row?.cnt ?? 0);
  };

export const makeUpsertCorpusWork = (db: Database.Database) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO corpus_works (
      corpus, work, title, he_title, primary_category,
      categories_json, section_names_json, address_types_json, updated_at
    ) VALUES (
      @corpus, @work, @title, @he_title, @primary_category,
      @categories_json, @section_names_json, @address_types_json, @updated_at
    )
  `);
  return (row: CorpusWorkRow) => {
    stmt.run(row);
  };
};

export const makeApplyEnrichmentBatch = (db: Database.Database) => {
  const updateStmt = db.prepare(`
    UPDATE segments SET
      enrichedAt = @enrichedAt,
      sefariaCanonicalRef = @sefariaCanonicalRef,
      sefariaNormalizedRef = @sefariaNormalizedRef,
      heRef = @heRef,
      sefariaUrl = @sefariaUrl,
      primaryCategory = @primaryCategory,
      categoriesJson = @categoriesJson,
      sectionNamesJson = @sectionNamesJson,
      daf = @daf,
      amud = @amud,
      enrichSegment = @enrichSegment,
      hasLinks = @hasLinks,
      linksCount = @linksCount
    WHERE id = @id
  `);
  const deleteLinksStmt = db.prepare(`DELETE FROM ref_links WHERE segment_id = ?`);
  const insertLinkStmt = db.prepare(`
    INSERT OR IGNORE INTO ref_links (id, segment_id, from_ref, to_ref, category, link_type, anchor_ref, source_work)
    VALUES (@id, @segment_id, @from_ref, @to_ref, @category, @link_type, @anchor_ref, @source_work)
  `);

  return (items: Array<{ update: SegmentEnrichmentUpdate; links: RefLinkRow[] }>) => {
    const run = db.transaction((rows: Array<{ update: SegmentEnrichmentUpdate; links: RefLinkRow[] }>) => {
      for (const item of rows) {
        updateStmt.run(item.update);
        deleteLinksStmt.run(item.update.id);
        for (const link of item.links) {
          insertLinkStmt.run({ ...link, source_work: link.source_work ?? null });
        }
      }
    });
    run(items);
  };
};

/** Matches {@link isAllowlistedTanakhCommentaryWork} in ingest/tanakhCommentaryAllowlist.ts — keep in sync. */
export const ALLOWLISTED_COMMENTARY_WORK_SQL = `(
  work LIKE 'Rashi on %' OR work LIKE 'Ramban on %' OR work LIKE 'Ibn Ezra on %'
  OR work LIKE 'Sforno on %' OR work LIKE 'Kli Yakar on %' OR work LIKE 'Klei Yakar on %'
)`;

export const makePruneTanakhCommentaryDisallowed = (db: Database.Database) => (): { deletedSegments: number } => {
  return db.transaction(() => {
    const sel = db.prepare(`
      SELECT rowid, id FROM segments
      WHERE type = 'tanakh_commentary'
      AND NOT ${ALLOWLISTED_COMMENTARY_WORK_SQL}
    `);
    const rows = sel.all() as { rowid: number; id: string }[];
    if (rows.length === 0) return { deletedSegments: 0 };

    const deleteLinksStmt = db.prepare(`DELETE FROM ref_links WHERE segment_id = ?`);
    const ftsDelStmt = db.prepare(`DELETE FROM segments_fts WHERE rowid = ?`);
    const segDelStmt = db.prepare(`DELETE FROM segments WHERE id = ?`);

    for (const r of rows) {
      deleteLinksStmt.run(r.id);
      ftsDelStmt.run(r.rowid);
      segDelStmt.run(r.id);
    }

    return { deletedSegments: rows.length };
  })();
};

export const makeListTanakhCommentaryGraphEnrichment =
  (db: Database.Database) =>
  (opts: { resumeOnly: boolean; afterRowid: number; limit: number }): TanakhCommentaryGraphRow[] => {
    const resumeClause = opts.resumeOnly ? "AND graphEnrichedAt IS NULL" : "";
    const stmt = db.prepare(`
      SELECT rowid AS rowid, id, work, ref, normalizedRef, lang
      FROM segments
      WHERE type = 'tanakh_commentary'
        AND ${ALLOWLISTED_COMMENTARY_WORK_SQL}
        ${resumeClause}
        AND rowid > ?
      ORDER BY rowid
      LIMIT ?
    `);
    return stmt.all(opts.afterRowid, opts.limit) as TanakhCommentaryGraphRow[];
  };

export const makeApplyTanakhCommentaryGraphBatch = (db: Database.Database) => {
  const updateStmt = db.prepare(`
    UPDATE segments SET
      graphBaseRef = @graphBaseRef,
      graphBaseNormRef = @graphBaseNormRef,
      graphTopicsJson = @graphTopicsJson,
      graphLinkedRefsJson = @graphLinkedRefsJson,
      graphLinkTypesJson = @graphLinkTypesJson,
      graphEnrichedAt = @graphEnrichedAt,
      tanakhCommentatorKey = @tanakhCommentatorKey
    WHERE id = @id
  `);
  return (items: TanakhCommentaryGraphUpdate[]) => {
    const run = db.transaction((rows: TanakhCommentaryGraphUpdate[]) => {
      for (const u of rows) updateStmt.run(u);
    });
    run(items);
  };
};
