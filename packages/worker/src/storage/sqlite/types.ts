import Database from "better-sqlite3";
import { Chunk } from "@kol-hatorah/core";

export interface CorpusWorkRow {
  corpus: string;
  work: string;
  title: string | null;
  he_title: string | null;
  primary_category: string | null;
  categories_json: string | null;
  section_names_json: string | null;
  address_types_json: string | null;
  updated_at: string;
}

export interface EnrichmentSegmentRow {
  rowid: number;
  id: string;
  type: string;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: string;
  source: string;
}

export interface SegmentEnrichmentUpdate {
  id: string;
  enrichedAt: string;
  sefariaCanonicalRef: string | null;
  sefariaNormalizedRef: string | null;
  heRef: string | null;
  sefariaUrl: string | null;
  primaryCategory: string | null;
  categoriesJson: string | null;
  sectionNamesJson: string | null;
  daf: string | null;
  amud: string | null;
  enrichSegment: string | null;
  hasLinks: number;
  linksCount: number;
}

/** Graph enrichment row for Tanakh commentary (base-ref–oriented metadata). */
export interface TanakhCommentaryGraphRow {
  rowid: number;
  id: string;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: string;
}

export interface TanakhCommentaryGraphUpdate {
  id: string;
  graphBaseRef: string | null;
  graphBaseNormRef: string | null;
  graphTopicsJson: string | null;
  graphLinkedRefsJson: string | null;
  graphLinkTypesJson: string | null;
  graphEnrichedAt: string;
  tanakhCommentatorKey: string | null;
}

export interface RefLinkRow {
  id: string;
  segment_id: string;
  from_ref: string;
  to_ref: string;
  category: string | null;
  link_type: string | null;
  anchor_ref: string | null;
  /** Sefaria work / book title for the segment that owns this link (optional for legacy rows). */
  source_work?: string | null;
}

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
  findTerm: (termNorm: string, scope?: ScopeFilter, limit?: number, offset?: number) => Array<any>;
  getRef: (normalizedRef: string) => any | null;
  countTerm: (termNorm: string, scope?: ScopeFilter) => number;
  getByPrefix: (prefix: string, scope?: ScopeFilter, limit?: number) => Array<any>;
  findTermByWork: (termNorm: string, scope?: ScopeFilter, limit?: number) => Array<{ work: string; count: number }>;
  listWorks: () => WorkRow[];
  getSegments: (scope?: ScopeFilter, limit?: number, offset?: number) => Array<any>;
  getSegmentsByBaseRef: (baseRef: string, type: string) => Array<any>;
  countSegments: (scope?: ScopeFilter) => number;
  searchByMatch: (match: string, scope?: ScopeFilter, limit?: number) => Array<any>;
  deleteSegmentsByTypeAndLang: (type: string, lang: string) => number;
  listSegmentsForEnrichment: (opts: {
    types: string[];
    resumeOnly: boolean;
    afterRowid: number;
    limit: number;
  }) => EnrichmentSegmentRow[];
  countSegmentsForEnrichment: (opts: { types: string[]; resumeOnly: boolean }) => number;
  applyEnrichmentBatch: (items: Array<{ update: SegmentEnrichmentUpdate; links: RefLinkRow[] }>) => void;
  pruneTanakhCommentaryDisallowed: () => { deletedSegments: number };
  listTanakhCommentaryGraphEnrichment: (opts: {
    resumeOnly: boolean;
    afterRowid: number;
    limit: number;
  }) => TanakhCommentaryGraphRow[];
  applyTanakhCommentaryGraphBatch: (items: TanakhCommentaryGraphUpdate[]) => void;
  upsertCorpusWork: (row: CorpusWorkRow) => void;
  close: () => void;
}
