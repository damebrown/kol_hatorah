/**
 * A1 — Sefaria pollution audit script
 *
 * Scans all Hebrew/merged.json files under SEFARIA_EXPORT_PATH and reports
 * every pollution type per file and per corpus. Pure read + report; no DB writes.
 *
 * Output: eval/pollution_audit.json  (+ human-readable summary to stdout)
 *
 * Usage:
 *   npx tsx packages/worker/scripts/auditSefaria.ts [--corpus <id>]
 */

import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@kol-hatorah/core";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PollutionCounts {
  htmlTags: number;
  htmlEntities: number;
  taamim: number;        // cantillation marks U+0591–U+05AF
  nikkud: number;        // vowel marks U+05B0–U+05C7
  paraMarkers: number;   // {ס} {פ}
  inlineRefs: number;    // (Hebrew book + chapter)
  controlChars: number;  // U+200f U+200e U+200b U+FEFF
  kriKetiv: number;      // <span class="mam-kq">
}

interface SegmentExample {
  ref: string;
  text: string;
  count: number;
}

interface PollutionDetail {
  segmentsAffected: number;
  totalOccurrences: number;
  examples: SegmentExample[];  // up to 3 worst per type
}

interface CorpusReport {
  fileCount: number;
  segmentCount: number;
  pollution: Record<keyof PollutionCounts, PollutionDetail>;
  topInlineRefs: Array<{ ref: string; count: number }>;  // top 50 across corpus
}

interface FileReport {
  path: string;
  corpus: string;
  segmentCount: number;
  totalPollutionHits: number;
  pollution: PollutionCounts;
}

interface AuditReport {
  generatedAt: string;
  sefariaExportPath: string;
  totalFiles: number;
  totalSegments: number;
  corpora: Record<string, CorpusReport>;
  worstFiles: FileReport[];  // top 20 most polluted files
}

// ─── Pollution regexes ────────────────────────────────────────────────────────

const RE_HTML_TAGS = /<[^>]+>/g;
const RE_HTML_ENTITIES = /&(?:nbsp|lt|gt|amp|quot|apos|#x?[\da-fA-F]+);/g;
const RE_TAAMIM = /[\u0591-\u05AF]/g;
const RE_NIKKUD = /[\u05B0-\u05C7]/g;
const RE_PARA_MARKERS = /\{[פס]\}/g;
// Hebrew parenthetical: ( followed by Hebrew letters/spaces/punct/digits )
const RE_INLINE_REFS = /\([\u05D0-\u05EA][\u05D0-\u05EA\s\u05F3\u05F4״׳,:.:\d\-–]{0,40}\)/g;
const RE_CONTROL_CHARS = /[\u200f\u200e\u200b\uFEFF]/g;
const RE_KRI_KETIV = /<span[^>]*class="mam-kq[^"]*"/g;

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

function auditSegment(text: string): PollutionCounts {
  return {
    htmlTags: countMatches(text, RE_HTML_TAGS),
    htmlEntities: countMatches(text, RE_HTML_ENTITIES),
    taamim: countMatches(text, RE_TAAMIM),
    nikkud: countMatches(text, RE_NIKKUD),
    paraMarkers: countMatches(text, RE_PARA_MARKERS),
    inlineRefs: countMatches(text, RE_INLINE_REFS),
    controlChars: countMatches(text, RE_CONTROL_CHARS),
    kriKetiv: countMatches(text, RE_KRI_KETIV),
  };
}

function zeroCounts(): PollutionCounts {
  return { htmlTags: 0, htmlEntities: 0, taamim: 0, nikkud: 0, paraMarkers: 0, inlineRefs: 0, controlChars: 0, kriKetiv: 0 };
}

function totalHits(c: PollutionCounts): number {
  return Object.values(c).reduce((s, n) => s + n, 0);
}

// ─── Corpus classifier ───────────────────────────────────────────────────────

function classifyCorpus(filePath: string): string {
  const p = filePath.replace(/\\/g, "/");
  if (/\/Tanakh\/(Torah|Prophets|Writings)\//.test(p)) return "tanakh";
  if (p.includes("/Mishnah/")) return "mishnah";
  if (p.includes("/Talmud/Bavli/")) return "bavli";
  if (p.includes("/Rishonim on Tanakh/Rashi/")) return "rashi";
  if (p.includes("/Rishonim on Tanakh/Ramban/")) return "ramban";
  if (/\/Rishonim on Tanakh\/Ibn Ezra/.test(p)) return "ibn_ezra";
  if (p.includes("/Mishneh Torah/")) return "mishneh_torah";
  if (p.includes("/Shulchan Arukh/")) return "shulchan_arukh";
  if (p.includes("/Midrash Rabbah/")) return "midrash_rabbah";
  if (p.includes("/Midrash Tanchuma/")) return "tanchuma";
  if (p.includes("/Guide for the Perplexed/")) return "moreh";
  if (p.includes("/Liturgy/")) return "siddur";
  return "other";
}

// ─── Walker (does NOT skip Rishonim — unlike listHebrewMergedJsonUnder) ───────

async function walkAllMergedFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.name.toLowerCase() === "merged.json" && path.basename(path.dirname(full)) === "Hebrew") {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out.sort();
}

// ─── Segment flattener ───────────────────────────────────────────────────────

function flattenLeaves(node: unknown, pathParts: Array<string | number> = []): Array<{ path: Array<string | number>; text: string }> {
  if (typeof node === "string") {
    const t = node.trim();
    return t.length ? [{ path: pathParts, text: t }] : [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child, i) => flattenLeaves(child, [...pathParts, i + 1]));
  }
  if (node && typeof node === "object") {
    return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) =>
      flattenLeaves(v, k === "" ? pathParts : [...pathParts, k])
    );
  }
  return [];
}

// ─── Inline ref extractor (for top-refs report) ───────────────────────────────

function extractInlineRefStrings(text: string): string[] {
  const matches = text.match(RE_INLINE_REFS);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1).trim()); // strip outer parens
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const config = getConfig();
  const sefariaRoot = config.sefariaExportPath;
  if (!sefariaRoot) {
    console.error("SEFARIA_EXPORT_PATH is not set in .env");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const corpusFilterIdx = args.indexOf("--corpus");
  const corpusFilter = corpusFilterIdx >= 0 ? args[corpusFilterIdx + 1] : null;

  const REPO_ROOT = path.resolve(__dirname, "../../../");
  const OUT_PATH = path.join(REPO_ROOT, "eval", "pollution_audit.json");

  console.log(`Sefaria export: ${sefariaRoot}`);
  console.log(`Walking all Hebrew/merged.json files...`);

  const jsonRoot = path.join(sefariaRoot, "json");
  const allFiles = await walkAllMergedFiles(jsonRoot);
  console.log(`Found ${allFiles.length} merged.json files.`);

  // ── Per-corpus accumulators ─────────────────────────────────────────────────
  const corpusCounts = new Map<string, PollutionCounts>();
  const corpusSegmentCount = new Map<string, number>();
  const corpusFileCount = new Map<string, number>();
  const corpusInlineRefFreq = new Map<string, Map<string, number>>();

  // Per pollution type: keep top-3 worst examples per corpus
  type ExampleMap = Map<string, Map<keyof PollutionCounts, SegmentExample[]>>;
  const corpusExamples: ExampleMap = new Map();

  const fileReports: FileReport[] = [];
  let totalSegments = 0;
  let processed = 0;

  for (const filePath of allFiles) {
    const corpus = classifyCorpus(filePath);
    if (corpusFilter && corpus !== corpusFilter) continue;

    processed++;
    if (processed % 500 === 0) process.stdout.write(`\r  Processed ${processed}/${allFiles.length} files...`);

    // Read + parse
    let parsed: any;
    try {
      const raw = await fs.readFile(filePath, "utf8");
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!parsed?.text) continue;

    const leaves = flattenLeaves(parsed.text);
    const fileCounts = zeroCounts();
    const refFreq = corpusInlineRefFreq.get(corpus) ?? new Map<string, number>();
    if (!corpusInlineRefFreq.has(corpus)) corpusInlineRefFreq.set(corpus, refFreq);

    for (const leaf of leaves) {
      const counts = auditSegment(leaf.text);
      for (const k of Object.keys(counts) as Array<keyof PollutionCounts>) {
        fileCounts[k] += counts[k];
      }

      // Track inline ref strings for top-refs
      if (counts.inlineRefs > 0) {
        for (const ref of extractInlineRefStrings(leaf.text)) {
          refFreq.set(ref, (refFreq.get(ref) ?? 0) + 1);
        }
      }

      // Track examples per corpus per pollution type
      const leafRef = `${parsed.title ?? path.dirname(filePath).split(path.sep).slice(-2).join("/")} ${leaf.path.join(":")}`;
      const exByCorpus = corpusExamples.get(corpus) ?? new Map();
      if (!corpusExamples.has(corpus)) corpusExamples.set(corpus, exByCorpus);

      const types = Object.keys(counts) as Array<keyof PollutionCounts>;
      for (const k of types) {
        if (counts[k] === 0) continue;
        const existing = exByCorpus.get(k) ?? [];
        if (!exByCorpus.has(k)) exByCorpus.set(k, existing);
        existing.push({ ref: leafRef, text: leaf.text.slice(0, 200), count: counts[k] });
        // Keep top 3 by count
        existing.sort((a, b) => b.count - a.count);
        if (existing.length > 3) existing.length = 3;
        exByCorpus.set(k, existing);
      }
    }

    // Accumulate into corpus totals
    const prev = corpusCounts.get(corpus) ?? zeroCounts();
    const pKeys = Object.keys(prev) as Array<keyof PollutionCounts>;
    const next = { ...prev };
    for (const k of pKeys) next[k] += fileCounts[k];
    corpusCounts.set(corpus, next);
    corpusSegmentCount.set(corpus, (corpusSegmentCount.get(corpus) ?? 0) + leaves.length);
    corpusFileCount.set(corpus, (corpusFileCount.get(corpus) ?? 0) + 1);
    totalSegments += leaves.length;

    const totalHitsInFile = totalHits(fileCounts);
    if (totalHitsInFile > 0) {
      fileReports.push({
        path: path.relative(sefariaRoot, filePath),
        corpus,
        segmentCount: leaves.length,
        totalPollutionHits: totalHitsInFile,
        pollution: { ...fileCounts },
      });
    }
  }

  console.log(`\nProcessed ${processed} files, ${totalSegments.toLocaleString()} total segments.`);

  // ── Assemble report ─────────────────────────────────────────────────────────
  const corpusNames = Array.from(new Set([...corpusCounts.keys(), ...corpusSegmentCount.keys()])).sort();
  const POLLUTION_KEYS: Array<keyof PollutionCounts> = [
    "htmlTags", "htmlEntities", "taamim", "nikkud", "paraMarkers", "inlineRefs", "controlChars", "kriKetiv",
  ];

  const corpora: Record<string, CorpusReport> = {};
  for (const corpus of corpusNames) {
    const counts = corpusCounts.get(corpus) ?? zeroCounts();
    const examples = corpusExamples.get(corpus) ?? new Map();
    const refFreq = corpusInlineRefFreq.get(corpus) ?? new Map();

    const pollution = {} as Record<keyof PollutionCounts, PollutionDetail>;
    for (const k of POLLUTION_KEYS) {
      // Compute segmentsAffected by scanning file reports for this corpus
      const affectedFiles = fileReports.filter((f) => f.corpus === corpus && f.pollution[k] > 0);
      pollution[k] = {
        segmentsAffected: affectedFiles.reduce((s, f) => s + (f.pollution[k] > 0 ? 1 : 0), 0),
        totalOccurrences: counts[k],
        examples: examples.get(k) ?? [],
      };
    }

    const topInlineRefs = Array.from(refFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([ref, count]) => ({ ref, count }));

    corpora[corpus] = {
      fileCount: corpusFileCount.get(corpus) ?? 0,
      segmentCount: corpusSegmentCount.get(corpus) ?? 0,
      pollution,
      topInlineRefs,
    };
  }

  const worstFiles = fileReports.sort((a, b) => b.totalPollutionHits - a.totalPollutionHits).slice(0, 20);

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    sefariaExportPath: sefariaRoot,
    totalFiles: processed,
    totalSegments,
    corpora,
    worstFiles,
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nReport written → ${OUT_PATH}`);

  // ── Human-readable summary ────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════");
  console.log(" Pollution Audit Summary");
  console.log("══════════════════════════════════════════════════════════");
  for (const corpus of corpusNames) {
    const r = corpora[corpus];
    console.log(`\n${corpus.padEnd(18)} ${r.fileCount} files  ${r.segmentCount.toLocaleString()} segments`);
    for (const k of POLLUTION_KEYS) {
      const d = r.pollution[k];
      if (d.totalOccurrences === 0) continue;
      console.log(`  ${k.padEnd(16)} ${String(d.totalOccurrences).padStart(8)} occurrences  (${d.segmentsAffected} files affected)`);
    }
    if (r.topInlineRefs.length > 0) {
      console.log(`  top inline refs: ${r.topInlineRefs.slice(0, 5).map((r) => `${r.ref}(×${r.count})`).join(", ")}`);
    }
  }
  console.log("\n══════════════════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
