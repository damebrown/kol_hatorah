import Database from "better-sqlite3";

export function ensureSchema(db: Database.Database) {
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
}
