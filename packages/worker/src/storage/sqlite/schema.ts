import Database from "better-sqlite3";

function tableColumnNames(db: Database.Database, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return new Set(rows.map((r) => r.name));
}

function ensureColumn(db: Database.Database, table: string, name: string, sqlType: string) {
  const cols = tableColumnNames(db, table);
  if (!cols.has(name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${sqlType}`);
  }
}

/** Adds Sefaria metadata columns and ref_links without touching lexical columns or FTS. */
function ensureEnrichmentSchema(db: Database.Database) {
  ensureColumn(db, "segments", "enrichedAt", "TEXT");
  ensureColumn(db, "segments", "sefariaCanonicalRef", "TEXT");
  ensureColumn(db, "segments", "sefariaNormalizedRef", "TEXT");
  ensureColumn(db, "segments", "heRef", "TEXT");
  ensureColumn(db, "segments", "sefariaUrl", "TEXT");
  ensureColumn(db, "segments", "primaryCategory", "TEXT");
  ensureColumn(db, "segments", "categoriesJson", "TEXT");
  ensureColumn(db, "segments", "sectionNamesJson", "TEXT");
  ensureColumn(db, "segments", "daf", "TEXT");
  ensureColumn(db, "segments", "amud", "TEXT");
  ensureColumn(db, "segments", "enrichSegment", "TEXT");
  ensureColumn(db, "segments", "hasLinks", "INTEGER");
  ensureColumn(db, "segments", "linksCount", "INTEGER");

  db.exec(`
    CREATE TABLE IF NOT EXISTS ref_links (
      id TEXT PRIMARY KEY NOT NULL,
      segment_id TEXT NOT NULL,
      from_ref TEXT NOT NULL,
      to_ref TEXT NOT NULL,
      category TEXT,
      link_type TEXT,
      anchor_ref TEXT
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ref_links_segment_id ON ref_links(segment_id);`);
  ensureColumn(db, "ref_links", "source_work", "TEXT");
}

/** Base-text–oriented graph metadata for reduced Tanakh commentary (offline pass). */
function ensureTanakhCommentaryGraphSchema(db: Database.Database) {
  ensureColumn(db, "segments", "graphBaseRef", "TEXT");
  ensureColumn(db, "segments", "graphBaseNormRef", "TEXT");
  ensureColumn(db, "segments", "graphTopicsJson", "TEXT");
  ensureColumn(db, "segments", "graphLinkedRefsJson", "TEXT");
  ensureColumn(db, "segments", "graphLinkTypesJson", "TEXT");
  ensureColumn(db, "segments", "graphEnrichedAt", "TEXT");
  ensureColumn(db, "segments", "tanakhCommentatorKey", "TEXT");
}

function ensureCorpusWorksTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS corpus_works (
      corpus TEXT NOT NULL,
      work TEXT NOT NULL,
      title TEXT,
      he_title TEXT,
      primary_category TEXT,
      categories_json TEXT,
      section_names_json TEXT,
      address_types_json TEXT,
      updated_at TEXT,
      PRIMARY KEY (corpus, work)
    );
  `);
}

export function ensureSchema(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  /** Wait up to 30s on SQLITE_BUSY / snapshot contention (e.g. second CLI while enrich runs). */
  db.pragma("busy_timeout = 30000");

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

  ensureEnrichmentSchema(db);
  ensureTanakhCommentaryGraphSchema(db);
  ensureCorpusWorksTable(db);
}
