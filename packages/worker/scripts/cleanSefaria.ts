/**
 * A6 — Clean copy pipeline
 *
 * Reads Hebrew/merged.json files from SEFARIA_EXPORT_PATH, applies all
 * cleaning rules, and writes to SEFARIA_CLEAN_PATH mirroring the exact
 * directory structure.
 *
 * Cleaning rules (in order):
 *  1. Kri/Ketiv: extract mam-kq-q (Qere) span content, discard Ketiv
 *  2. Strip all remaining HTML tags
 *  3. Decode HTML entities
 *  4. Strip {ס} {פ} paragraph markers
 *  5. Strip Unicode control chars (U+200f U+200e U+200b U+FEFF)
 *  6. Extract inline scripture refs via extractInlineRefs()
 *  7. Normalize whitespace (collapse runs, trim)
 *
 * Nikkud and taamim are NOT stripped here — they are stripped at embed time
 * by CohereEmbeddingService (Decision A).
 *
 * Output JSON adds a top-level _quotedRefsIndex field:
 *   Record<segmentPath, string[]>  (path = "1:2:3" style keys)
 *
 * Usage:
 *   npx tsx packages/worker/scripts/cleanSefaria.ts [--dry-run] [--corpus <id>]
 *   npx tsx packages/worker/scripts/cleanSefaria.ts --input <path> --output <path>
 */

import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@kol-hatorah/core";
import { extractInlineRefs } from "../src/ingest/extractInlineRefs";

// ─── Cleaning rules ───────────────────────────────────────────────────────────

// Kri/Ketiv: capture the Qere text from <span class="mam-kq-q">...</span>
// The outer span wraps both Ketiv and Qere; we want only Qere.
const RE_KRI_KETIV_OUTER = /<span[^>]*class="mam-kq"[^>]*>([\s\S]*?)<\/span>/g;
const RE_KRI_KETIV_QERE = /<span[^>]*class="mam-kq-q"[^>]*>([\s\S]*?)<\/span>/;

function resolveKriKetiv(segment: string): string {
  return segment.replace(RE_KRI_KETIV_OUTER, (_, inner: string) => {
    const qereMatch = inner.match(RE_KRI_KETIV_QERE);
    return qereMatch ? qereMatch[1] : inner;
  });
}

const RE_HTML_TAGS = /<[^>]+>/g;

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
};

function decodeHtmlEntities(text: string): string {
  // Named entities
  let result = text.replace(/&(?:nbsp|lt|gt|amp|quot|apos);/g, (m) => HTML_ENTITY_MAP[m] ?? m);
  // Numeric entities (hex or decimal) — typically control/RTL marks: discard
  result = result.replace(/&#x?[\da-fA-F]+;/g, "");
  return result;
}

const RE_PARA_MARKERS = /\{[פס]\}\s*/g;
const RE_CONTROL_CHARS = /[\u200f\u200e\u200b\uFEFF]/g;
const RE_WHITESPACE = /\s+/g;

export function cleanSegment(raw: string): { displayText: string; quotedRefs: string[] } {
  let text = raw;
  text = resolveKriKetiv(text);
  text = text.replace(RE_HTML_TAGS, "");
  text = decodeHtmlEntities(text);
  text = text.replace(RE_PARA_MARKERS, "");
  text = text.replace(RE_CONTROL_CHARS, "");
  const { cleanText, refs } = extractInlineRefs(text);
  text = cleanText.replace(RE_WHITESPACE, " ").trim();
  return { displayText: text, quotedRefs: refs };
}

// ─── Walker ───────────────────────────────────────────────────────────────────

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

// ─── Corpus classifier (same as auditSefaria) ─────────────────────────────────

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

// ─── Text-tree cleaner ────────────────────────────────────────────────────────

interface CleanResult {
  cleaned: unknown;
  quotedRefsIndex: Record<string, string[]>;
  segmentCount: number;
  modifiedCount: number;
}

function cleanTextTree(
  node: unknown,
  pathParts: Array<string | number>,
  result: CleanResult
): unknown {
  if (typeof node === "string") {
    const { displayText, quotedRefs } = cleanSegment(node);
    result.segmentCount++;
    if (displayText !== node) result.modifiedCount++;
    if (quotedRefs.length > 0) {
      const key = pathParts.join(":");
      result.quotedRefsIndex[key] = quotedRefs;
    }
    return displayText;
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => cleanTextTree(child, [...pathParts, i + 1], result));
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = cleanTextTree(v, k === "" ? pathParts : [...pathParts, k], result);
    }
    return out;
  }
  return node;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const config = getConfig();
  const args = process.argv.slice(2);

  const dryRun = args.includes("--dry-run");
  const corpusFilterIdx = args.indexOf("--corpus");
  const corpusFilter = corpusFilterIdx >= 0 ? args[corpusFilterIdx + 1] : null;

  const inputIdx = args.indexOf("--input");
  const outputIdx = args.indexOf("--output");
  const inputRoot = inputIdx >= 0 ? args[inputIdx + 1] : config.sefariaExportPath;
  const outputRoot = outputIdx >= 0 ? args[outputIdx + 1] : config.sefariaCleanPath;

  if (!inputRoot) {
    console.error("No input path: set SEFARIA_EXPORT_PATH or pass --input <path>");
    process.exit(1);
  }
  if (!outputRoot && !dryRun) {
    console.error("No output path: set SEFARIA_CLEAN_PATH or pass --output <path>");
    process.exit(1);
  }

  console.log(`Input:   ${inputRoot}`);
  console.log(`Output:  ${dryRun ? "(dry run — no writes)" : outputRoot}`);
  if (corpusFilter) console.log(`Corpus filter: ${corpusFilter}`);

  const jsonRoot = path.join(inputRoot, "json");
  const allFiles = await walkAllMergedFiles(jsonRoot);

  const targetFiles = corpusFilter
    ? allFiles.filter((f) => classifyCorpus(f) === corpusFilter)
    : allFiles;

  console.log(`Found ${targetFiles.length} files to process.`);

  let totalSegments = 0;
  let totalModified = 0;
  let processed = 0;

  for (const filePath of targetFiles) {
    processed++;
    if (processed % 500 === 0) process.stdout.write(`\r  Processed ${processed}/${targetFiles.length}...`);

    let parsed: any;
    try {
      const raw = await fs.readFile(filePath, "utf8");
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!parsed?.text) continue;

    const result: CleanResult = { cleaned: null, quotedRefsIndex: {}, segmentCount: 0, modifiedCount: 0 };
    result.cleaned = cleanTextTree(parsed.text, [], result);

    totalSegments += result.segmentCount;
    totalModified += result.modifiedCount;

    if (dryRun) continue;

    const relPath = path.relative(path.join(inputRoot, "json"), filePath);
    const outPath = path.join(outputRoot!, "json", relPath);

    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const outJson = {
      ...parsed,
      text: result.cleaned,
      _quotedRefsIndex: Object.keys(result.quotedRefsIndex).length ? result.quotedRefsIndex : undefined,
    };
    await fs.writeFile(outPath, JSON.stringify(outJson));
  }

  console.log(`\nDone. ${processed} files, ${totalSegments.toLocaleString()} segments, ${totalModified.toLocaleString()} modified.`);
  if (dryRun) console.log("(Dry run — no files written)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
