Full Codebase Analysis Before the Plan                                                                                                                                          
                                                                                                                                                                                  
  The 5 pipelines and their differences                                                                                                                                           
                                                                                                                                                                                  
  ┌────────────┬────────────────────────────────────┬──────────────────────────────┬────────────────────┬──────────────────────────────┬─────────────────────────────────────┐    
  │  Pipeline  │               Entry                │       Discovery method       │     Enrichment     │          Ref format          │             Unique code             │    
  ├────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────┼──────────────────────────────┼─────────────────────────────────────┤    
  │            │                                    │                              │ None inline —      │                              │                                     │
  │ Tanakh     │ cli/commands/ingest.ts             │ Scans                        │ separate           │ Genesis 1:1 from 1-based     │ Uses loadSefariaSegmentsFromMerged  │
  │            │                                    │ Torah/Prophets/Writings dirs │ enrich:metadata    │ indices                      │                                     │    
  │            │                                    │                              │ step               │                              │                                     │
  ├────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────┼──────────────────────────────┼─────────────────────────────────────┤    
  │ Mishnah    │ same file (next 130 lines)         │ Scans Seder X/Tractate dirs  │ None inline —      │ Mishnah Sanhedrin 1:1 from   │ ~90% identical to Tanakh            │
  │            │                                    │                              │ separate step      │ indices                      │                                     │    
  ├────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────┼──────────────────────────────┼─────────────────────────────────────┤    
  │            │                                    │                              │ Inline Sefaria API │ Sanhedrin 2a:1 via daf:amud  │ loadBavliLeavesFromMergedText,      │
  │ Bavli      │ ingest/ingestBavli.ts              │ Explicit tractate list       │  (name + v3 +      │ math                         │ refs.ts                             │    
  │            │                                    │                              │ links)             │                              │                                     │    
  ├────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────┼──────────────────────────────┼─────────────────────────────────────┤
  │ Corpora    │ ingest/ingestCorpora.ts            │ listHebrewMergedJsonUnder()  │ Inline same as     │ Title, Section 1:2 from      │ Registry spec, 6 corpora            │    
  │            │                                    │ recursive                    │ Bavli              │ indices                      │                                     │    
  ├────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────┼──────────────────────────────┼─────────────────────────────────────┤
  │            │                                    │                              │ None — separate    │ Broken:                      │ extractCommentaryLeaves, own        │    
  │ Commentary │ ingest/ingestTanakhCommentaries.ts │ Own collectMergedJsonFiles   │ graph-enrich step  │ docId:encodedSectionPath     │ CommentaryChunk type, opens SQLite  │
  │            │                                    │                              │                    │ (not Sefaria-compatible)     │ per file                            │
  └────────────┴────────────────────────────────────┴──────────────────────────────┴────────────────────┴──────────────────────────────┴─────────────────────────────────────┘

  Redundancies to eliminate

  1. Tanakh ≈ Mishnah: ~90% identical — same loop, same loader, same checkpoint pattern, same embedding call                                                                      
  2. Two directory walkers: findHebrewMergedFile (scored heuristic) and listHebrewMergedJsonUnder (simple recursive) serve the same purpose differently
  3. Checkpoint write pattern repeated 3× identically (mkdir + writeFile)                                                                                                         
  4. loadLeavesFromMergedFile in ingestCorpora.ts duplicates flattenMergedExportText from sefariaLoader.ts                                                                        
  5. Commentary SQLite: opens a new getSQLiteManager() per file in a loop — should be opened once                                                                                 
  6. splitOversizedChunks: only called by Commentary; Tanakh and Mishnah skip this entirely                                                                                       
  7. Two inline-ref extraction approaches exist but neither stores as metadata: enrichSefariaMergedSegment fetches Sefaria links API (graph links), but parenthetical (ספר פרק)   
  refs in text body are never extracted                                                                                                                                           
                                                                                                                                                                                  
  The Commentary ref problem                                                                                                                                                      
                  
  Commentary refs look like a3f82bc1:5/3/2 instead of Rashi on Genesis 1:1. This breaks:                                                                                          
  - getRef() queries by normalizedRef
  - Cross-ref lookup between commentary and base text                                                                                                                             
  - The tanakh-commentary:reduce-and-graph-enrich step was added specifically to patch this after the fact
                                                                                                                                                                                  
  The fix in the re-ingest: Commentary should route through enrichSefariaMergedSegment like Bavli/Corpora, which calls the Sefaria Name API and gets back Rashi on Genesis 1:1 as 
  the canonical ref.                                                                                                                                                              
                                                                                                                                                                                  
  ---                                                                                                                                                                             
  Revised Comprehensive Plan
                                                                                                                                                                                  
  ---
  Phase 0 — Pollution audit script (before any code changes)                                                                                                                      
                                                                                                                                                                                  
  scripts/auditSefaria.ts — read-only, no DB writes. Walks all Hebrew/merged.json files across all corpora used in the pipelines and emits eval/pollution_audit.json with per-file
   counts of:                                                                                                                                                                     
  - HTML tags (by tag name)
  - HTML entities                                                                                                                                                                 
  - Taamim / nikkud segments
  - {ס} {פ} paragraph markers                                                                                                                                                     
  - Parenthetical inline refs (ספר פרק) — counted, with examples
  - Kri/Ketiv spans                                                                                                                                                               
  - Empty/very-short segments (< 5 chars)                                                                                                                                         
                                                                                                                                                                                  
  Output also includes a per-corpus summary so you can see the extent before touching anything.                                                                                   
                                                                                                                                                                                  
  ---                                                                                                                                                                             
  Phase 1 — Text cleaning pipeline                                                                                                                                                
                                  
  Before I write this, I need to confirm the folder structure you expect to target. From my exploration, the files are:
                                                                                                                                                                                  
  json/Tanakh/Torah/Genesis/Hebrew/merged.json
  json/Tanakh/Prophets/Isaiah/Hebrew/merged.json                                                                                                                                  
  json/Tanakh/Writings/Psalms/Hebrew/merged.json
                                                                                                                                                                                  
  json/Mishnah/Seder Nezikin/Mishnah Sanhedrin/Hebrew/merged.json                                                                                                                 
  
  json/Talmud/Bavli/Seder Nezikin/Sanhedrin/Hebrew/merged.json                                                                                                                    
                      ↑ "Seder X" layer between "Bavli" and tractate
                                                                                                                                                                                  
  json/Halakhah/Mishneh Torah/Sefer Korbanot/Mishneh Torah, Paschal Offering/Hebrew/merged.json                                                                                   
  json/Halakhah/Shulchan Arukh/...                                                                                                                                                
  json/Midrash/Aggadah/Midrash Rabbah/...                                                                                                                                         
  json/Midrash/Aggadah/Midrash Tanchuma/...                                                                                                                                       
  
  Please confirm this matches your actual structure and that merged.json inside Hebrew/ is always the authoritative file we should use.                                           
                  
  scripts/cleanSefaria.ts:                                                                                                                                                        
  - Input: SEFARIA_EXPORT_PATH/json/
  - Output: SEFARIA_CLEAN_PATH/json/ (new env var), mirrors directory + file names exactly                                                                                        
  - Processes only Hebrew/merged.json files (copies all other files verbatim)             
  - Applies cleanSegment() to every string leaf in the text field, preserves all other JSON fields intact                                                                         
                                                                                                                                                                                  
  cleanSegment(raw: string) → { displayText: string; quotedRefs: string[] }                                                                                                       
                                                                                                                                                                                  
  The function now returns two things:                                                                                                                                            
  1. displayText — cleaned text for storage and display (nikkud preserved):                                                                                                       
    - Kri/Ketiv: extract mam-kq-q span content, replace the whole span                                                                                                            
    - Strip all HTML tags (after special-span handling)               
    - Decode HTML entities (&nbsp; → space, &lt; → <, &#x200f; → empty, etc.)                                                                                                     
    - Strip Unicode control chars \u200f \u200e \u200b \ufeff                                                                                                                     
    - Strip {ס} {פ} curly-bracket paragraph markers                                                                                                                               
    - Remove parenthetical scripture refs: (בראשית ד) → removed from text, collected into quotedRefs                                                                              
    - Normalize whitespace                                                                                                                                                        
  2. quotedRefs — array of the parenthetical refs found: ["בראשית ד", "ויקרא ה", "משלי יא"]                                                                                       
                                                                                                                                                                                  
  The cleaned JSON stores both in the segment, so the output file format gains a quotedRefs field per leaf. The original structure (text being a nested array) is preserved, but  
  each string leaf becomes { text: "...", quotedRefs: [...] }.                                                                                                                    
                                                                                                                                                                                  
  Wait — that changes the structure. Let me think about this differently.                                                                                                         
                  
  Actually the cleaner approach: the JSON file keeps text as-is (nested array of strings), and adds a parallel quotedRefsMap field at the top level: a flat Record<string,        
  string[]> keyed by the segment's export ref. The ingest pipeline reads both.
                                                                                                                                                                                  
  --dry-run mode: logs what would change without writing. --corpus <id>: clean only one corpus. Idempotent.                                                                       
  
  ---                                                                                                                                                                             
  Phase 2 — Parenthetical ref extraction
                                        
  A new utility packages/worker/src/ingest/extractInlineRefs.ts:
                                                                                                                                                                                  
  // Extracts parenthetical scripture refs from Hebrew text
  // Input:  "...שֶׁנֶּאֱמַר (דברים כב) לֹא תִלְבַּשׁ..."                                                                                                                                     
  // Output: { cleanText: "...שֶׁנֶּאֱמַר לֹא תִלְבַּשׁ...", refs: ["דברים כב"] }                                                                                                             
  extractInlineRefs(text: string): { cleanText: string; refs: string[] }                                                                                                          
                                                                                                                                                                                  
  The regex pattern: parenthesized content matching a known Hebrew book name + optional chapter/verse. Returns both the cleaned text and the extracted refs.                      
                                                                                                                                                                                  
  Schema additions:                                                                                                                                                               
                  
  In Chunk (types.ts):                                                                                                                                                            
  quotedRefs?: string[];   // ["בראשית ד", "ויקרא ה"]
                                                                                                                                                                                  
  In SQLite segments table: new column quotedRefsJson TEXT (JSON array).                                                                                                          
                                                                                                                                                                                  
  New SQLite queries:                                                                                                                                                             
  - findSegmentsQuotingRef(ref: string) — find all segments whose quotedRefsJson contains a given ref (JSON LIKE or FTS-based)                                                    
  - listQuotedRefsForWork(work: string) — all quoted refs from a given work's segments                                                                                            
                                                                                      
  These enable your "all works that quote X" and "all quoted refs in work Y" queries.                                                                                             
                                                                                                                                                                                  
  ---                                                                                                                                                                             
  Phase 3 — Pipeline unification + cleanup                                                                                                                                        
                                          
  This is the most invasive refactor. The goal: one generic ingest runner that Tanakh, Mishnah, Bavli, Corpora, and Commentary all use — eliminating ~500 lines of duplicated
  code.                                                                                                                                                                           
  
  New packages/worker/src/ingest/runIngestGeneric.ts:                                                                                                                             
                  
  interface GenericIngestSpec {                                                                                                                                                   
    corpusId: string;           // for checkpoint keying and logging
    segmentType: TextType;
    mergedFiles: string[];      // pre-discovered list of absolute paths                                                                                                          
    getExportRef: (workTitle: string, path: Array<string|number>) => string;  // ref builder
    preprocess?: (text: unknown) => BavliSpecialParsing | null;  // for Bavli daf mapping                                                                                         
  }                                                                                                                                                                               
  
  Each pipeline becomes a thin wrapper that:                                                                                                                                      
  1. Discovers files (using the appropriate discovery method)
  2. Builds a GenericIngestSpec                                                                                                                                                   
  3. Calls runIngestGeneric()  
                                                                                                                                                                                  
  The generic runner handles: batch loop, enrichSefariaMergedSegment, inline ref extraction, SQLite insert, Cohere embedding, Qdrant upsert, checkpoint.
                                                                                                                                                                                  
  Commentary gets fixed: instead of commentaryExtractor.ts building opaque hash-based refs, Commentary now goes through enrichSefariaMergedSegment → Sefaria Name API returns     
  Rashi on Genesis 1:1. The extractCommentaryLeaves helper still does the tree traversal, but the ref it emits is used only as the exportRef hint to the Name API.                
                                                                                                                                                                                  
  Enrichment timing unified: all pipelines enrich inline during ingest. The separate enrich:metadata step becomes a no-op (or removed). No more two-phase approach.               
  
  Checkpoint helper extracted:                                                                                                                                                    
  // packages/worker/src/ingest/checkpoint.ts
  saveCheckpoint(path: string, state: Record<string, boolean>): Promise<void>                                                                                                     
  loadCheckpoint(path: string): Promise<Record<string, boolean>>             
                                                                                                                                                                                  
  splitOversizedChunks applied uniformly to all corpora (currently skipped by Tanakh/Mishnah).
                                                                                                                                                                                  
  ---             
  Phase 4 — Commentary corpus reduction                                                                                                                                           
                                       
  Before re-ingesting, decide which commentators to keep. Current allowlist: Rashi, Ramban, Ibn Ezra, Sforno, Kli Yakar.
                                                                                                                                                                                  
  Decision needed from you: Should we narrow this further for the re-ingest, or keep the 5? My recommendation given the space problem: keep Rashi + Ramban + Ibn Ezra (the three  
  most foundational, broadest coverage, best signal-to-noise). Sforno and Kli Yakar add significant volume for marginal retrieval gain.                                           
                                                                                                                                                                                  
  The corpus reduction strategy you selected: delete most commentary, not per-corpus pre-delete. This means:                                                                      
  - The re-ingest only ingests allowlisted commentators
  - Before re-ingesting commentary: DELETE FROM segments WHERE type='tanakh_commentary' AND work NOT LIKE 'Rashi on %' AND work NOT LIKE ... on SQLite; delete + recreate the     
  Qdrant collection                                                                                                                                                          
  - A new CLI command: ingest:commentary:reduce that applies the filter without re-ingesting                                                                                      
  
  ---                                                                                                                                                                             
  Phase 5 — Cohere embedding service
                                                                                                                                                                                  
  packages/core/src/embedding.ts — new interface:
  interface EmbeddingService {                                                                                                                                                    
    embedTexts(texts: string[], opts?: { inputType?: "search_document" | "search_query" }): Promise<number[][]>;
    readonly modelDim: number;                                                                                  
  }                                                                                                                                                                               
   
  packages/core/src/cohere.ts — CohereEmbeddingService:                                                                                                                           
  - Uses cohere-ai npm package                                                                                                                                                    
  - Model: embed-multilingual-v3.0 (1024d)                                                                                                                                        
  - search_document during ingest, search_query during retrieval — this is Cohere's key advantage                                                                                 
  - Pre-embed text processor: strip nikkud [\u05B0-\u05C7] and taamim [\u0591-\u05AF] from text before the API call (Decision A1)                                                 
  - Retry logic mirroring OpenAI's                                                                                                                                                
                                                                                                                                                                                  
  Config (config.ts + .env.example):                                                                                                                                              
  COHERE_API_KEY=                                                                                                                                                                 
  COHERE_EMBEDDING_MODEL=embed-multilingual-v3.0
  EMBEDDING_PROVIDER=cohere   # or "openai"                                                                                                                                       
                                                                                                                                                                                  
  OpenAIService.embedTexts() also implements EmbeddingService (no breaking change).
                                                                                                                                                                                  
  MAX_EMBED_CHARS in splitOversizedChunks.ts updated: Cohere's limit is 512 tokens per text (not 8192 like OpenAI). At ~2 chars/token for Hebrew, that's ~1000 chars. This means  
  many more chunks will need splitting, especially Mishneh Torah and Bavli.                                                                                                       
                                                                                                                                                                                  
  ---             
  Phase 6 — New Qdrant collection + re-ingestion order
                                                      
  - New QDRANT_COLLECTION_PREFIX=hebrag_v3 (don't touch existing hebrag_dev)
  - New collection: hebrag_v3_chunks_v2 with 1024-dimensional vectors                                                                                                             
  - Ingest order (smallest → largest for smoke testing):                                                                                                                          
    a. Mishnah (small, clean, no daf complexity)                                                                                                                                  
    b. Tanakh                                                                                                                                                                     
    c. Bavli (core tractates first)                                                                                                                                               
    d. Corpora (mishneh-torah last — it's the largest)                                                                                                                            
    e. Commentary (allowlisted only)                                                                                                                                              
  - After each corpus: spot-check 5 queries, verify Qdrant retrieval quality vs old collection                                                                                    
  - Old collection hebrag_dev_chunks_v2 kept until you're satisfied, then dropped                                                                                                 
                                                                                                                                                                                  
  ---                                                                                                                                                                             
  Phase 7 — Ref format audit + alignment                                                                                                                                          
                                                                                                                                                                                  
  During re-ingest, enrichSefariaMergedSegment calls the Sefaria Name API and stores sefariaCanonicalRef. The issue is the export-derived ref (what we pass to the API) needs to
  be close enough for the API to resolve it.                                                                                                                                      
                  
  Known mismatches to fix:                                                                                                                                                        
  - Tanakh: flattenVersionText builds Genesis 1:1 (should be fine)
  - Mishnah: builds Mishnah Sanhedrin 1:1 — Sefaria uses Mishnah Sanhedrin 1:1 ✓                                                                                                  
  - Bavli: builds Sanhedrin 2a:1 — Sefaria uses same format ✓                   
  - Corpora: flattenMergedExportText builds refs from title + 1-based indices — needs verification per-corpus. Mishneh Torah, Laws of Prayer 1:1 format needs testing             
                                                                                                                                                                                  
  A pre-ingest validation step: for each corpus, test the first 5 refs against the Sefaria Name API and log whether they resolve. Fail loudly if >20% fail.                       
                                                                                                                                                                                  
  ---                                                                                                                                                                             
  Questions before I write any code                                                                                                                                               
                                                                                                                                                                                  
  Q1 (Folder structure verification): Please confirm the key Sefaria paths I found are correct:
  - Bavli tractates sit under json/Talmud/Bavli/Seder X/TractateY/Hebrew/merged.json (not directly under Bavli)                                                                   
  - Tanakh files: json/Tanakh/Torah|Prophets|Writings/Book/Hebrew/merged.json                                                                                                     
  - Mishnah: json/Mishnah/Seder X/Mishnah Tractate/Hebrew/merged.json                                                                                                             
                                                                                                                                                                                  
  Are there any books/tractates where the file doesn't follow this pattern (e.g., missing the Seder layer, or named differently)?                                                 
                                                                                                                                                                                  
  Q2 (Commentary allowlist): For the new ingest, which commentators do you want to keep? I suggest Rashi + Ramban + Ibn Ezra. Do you agree, or would you add/remove?              
                                                                                                                                                                                  
  Q3 (Corpora scope): The registry has 6 corpora: midrash-rabbah, tanchuma, moreh (Guide for Perplexed), mishneh-torah, shulchan-arukh, siddur. All 6 for re-ingest, or do you    
  want to drop any?
                                                                                                                                                                                  
  Q4 (Cohere token limit): Cohere embed-multilingual-v3.0 has a 512-token limit per segment. At Hebrew density (~1.5–2 chars/token), that's roughly 750–1000 chars. This means    
  splitting many more segments than before. splitOversizedChunks currently uses 3000 chars (safe for OpenAI). Should I lower it to ~900 chars for Cohere, or do you want to test
  empirically first?              