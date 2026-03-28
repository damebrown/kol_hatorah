import fs from "fs/promises";
import path from "path";
import { Chunk, TextType, createChunkId } from "@kol-hatorah/core";

export interface WorkTarget {
  type: TextType;
  work: string;
  categoryGuess: "Tanakh" | "Mishnah" | "Talmud/Bavli";
}

export interface FindResult {
  filePath: string | null;
  candidates: string[];
}

const EXCLUDE_PATTERNS = [/Rishonim/i, /Acharonim/i, /Commentary/i, /Guides/i, /Modern Commentary/i, /Targum/i, /Onkelos/i];
const WORK_ALIASES: Record<string, string[]> = {
  Kings: ["I Kings", "II Kings"],
  "I Kings": ["I Kings"],
  "II Kings": ["II Kings"],
  Avot: ["Pirkei Avot"],
  "Pirkei Avot": ["Pirkei Avot"],
};

async function collectFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await collectFiles(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function scorePath(p: string, target: WorkTarget): number {
  let score = 0;
  if (p.includes("Hebrew/merged.json") || p.includes("Hebrew/merged.txt")) score += 5;
  if (p.includes("/Seder/")) score += 3;
  const segments = p.split(path.sep);
  if (segments.some((s) => s === target.work)) score += 10;
  else if (segments.some((s) => s.toLowerCase() === target.work.toLowerCase())) score += 5;
  if (target.categoryGuess === "Mishnah" && p.includes("/Mishnah/")) score += 1;
  if (target.categoryGuess === "Talmud/Bavli" && p.includes("/Bavli/")) score += 1;
  if (target.categoryGuess === "Tanakh" && p.includes("/Tanakh/")) score += 1;
  for (const ex of EXCLUDE_PATTERNS) {
    if (ex.test(p)) score -= 10;
  }
  return score;
}

function categoryRoot(root: string, target: WorkTarget): string {
  if (target.categoryGuess === "Tanakh") return path.join(root, "json", "Tanakh");
  if (target.categoryGuess === "Mishnah") return path.join(root, "json", "Mishnah");
  if (target.categoryGuess === "Talmud/Bavli") return path.join(root, "json", "Talmud", "Bavli");
  return path.join(root, "json");
}

export async function findHebrewMergedFile(root: string, target: WorkTarget): Promise<FindResult> {
  const base = categoryRoot(root, target);
  let files: string[] = [];
  try {
    files = await collectFiles(base);
  } catch {
    return { filePath: null, candidates: [] };
  }
  const aliases = WORK_ALIASES[target.work] || [target.work];
  const filtered = files.filter((f) => /Hebrew\/merged\.(json|txt)$/i.test(f));
  // Exact segment match only
  const exactMatches = filtered.filter((f) => {
    const segments = f.split(path.sep);
    return aliases.some((a) => segments.some((s) => s === a));
  });

  const rankedExact = exactMatches
    .map((f) => ({ f, s: scorePath(f, target) }))
    .sort((a, b) => b.s - a.s);

  for (const cand of rankedExact) {
    try {
      const raw = await fs.readFile(cand.f, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed?.language === "he" && parsed?.text) {
        const title = parsed?.title;
        if (!title || !aliases.includes(title) && title !== target.work) {
          continue;
        }
        return { filePath: cand.f, candidates: rankedExact.map((r) => r.f) };
      }
    } catch {
      continue;
    }
  }

  // No exact matches; provide closest candidates (same category root)
  const rankedAll = filtered
    .map((f) => ({ f, s: scorePath(f, target) }))
    .sort((a, b) => b.s - a.s);
  return {
    filePath: null,
    candidates: rankedAll.map((r) => r.f),
  };
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Build export-derived refs aligned with common Sefaria shapes:
 * - Pure indices: `Work 1:2:3`
 * - Named section + numeric address: `Work, Part 1 5:5` (space before trailing numbers; avoids `::` from empty JSON keys)
 */
function buildRefFromPath(work: string, pathParts: Array<string | number>): string {
  const parts = pathParts.filter((p) => p !== "" && p != null);
  if (parts.length === 0) return work;

  let splitAt = parts.length;
  while (splitAt > 0 && typeof parts[splitAt - 1] === "number") {
    splitAt -= 1;
  }
  const numericSuffix = parts.slice(splitAt) as number[];
  const prefix = parts.slice(0, splitAt);

  if (prefix.length === 0) {
    const str = numericSuffix.join(":");
    return numericSuffix.length === 1 ? `${work} ${String(numericSuffix[0])}` : `${work} ${str}`;
  }

  const prefixStr = prefix.map(String).join(", ");
  if (numericSuffix.length === 0) {
    return `${work}, ${prefixStr}`;
  }

  const numStr = numericSuffix.join(":");
  return `${work}, ${prefixStr} ${numStr}`;
}

export function flattenVersionText(
  text: any,
  work: string,
  type: TextType,
  pathParts: Array<string | number> = []
): Array<{
  text: string;
  normalizedText: string;
  ref: string;
  normalizedRef: string;
}> {
  const out: Array<{ text: string; normalizedText: string; ref: string; normalizedRef: string }> = [];
  if (Array.isArray(text)) {
    for (let i = 0; i < text.length; i++) {
      const part = text[i];
      const nextPath = [...pathParts, i + 1];
      out.push(...flattenVersionText(part, work, type, nextPath));
    }
  } else if (text !== null && typeof text === "object" && !Array.isArray(text)) {
    const keys = Object.keys(text as object).sort((a, b) => a.localeCompare(b, "en"));
    for (const k of keys) {
      const child = (text as Record<string, unknown>)[k];
      // Sefaria schema often uses "" as a default node; including it in the path yields invalid `::` refs.
      const nextPath = k === "" ? pathParts : [...pathParts, k];
      out.push(...flattenVersionText(child, work, type, nextPath));
    }
  } else if (typeof text === "string") {
    const trimmed = text.trim();
    if (trimmed.length === 0) return out;
    const ref = buildRefFromPath(work, pathParts);
    out.push({
      text: trimmed,
      normalizedText: stripHtml(trimmed),
      ref,
      normalizedRef: ref,
    });
  }
  return out;
}

/** Flatten a Sefaria merged.json `text` tree to string leaves; refs use `workTitle` + 1-based indices (segment granularity of the export). */
export function flattenMergedExportText(
  workTitle: string,
  text: unknown
): Array<{ text: string; normalizedText: string; ref: string; normalizedRef: string }> {
  return flattenVersionText(text, workTitle, "tanakh");
}

export async function loadSefariaSegmentsFromMerged(
  mergedPath: string,
  target: WorkTarget
): Promise<Chunk[]> {
  let parsed: any;
  try {
    const raw = await fs.readFile(mergedPath, "utf8");
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (parsed?.language && parsed.language !== "he") return [];
  const aliases = WORK_ALIASES[target.work] || [target.work];
  if (parsed?.title && !aliases.includes(parsed.title) && parsed.title !== target.work) {
    throw new Error(`Title mismatch: requested=${target.work}, title=${parsed.title}, path=${mergedPath}`);
  }

  const text = parsed?.text;
  if (!text) return [];

  const createdAt = new Date().toISOString();
  const versionTitle = parsed?.versionTitle;
  const versionSource = parsed?.versionSource;

  const leaves = flattenVersionText(text, target.work, target.type);
  return leaves.map((leaf) => {
    const id = createChunkId({
      type: target.type,
      work: target.work,
      normalizedRef: leaf.normalizedRef,
      ref: leaf.ref,
      lang: "he",
      versionTitle,
      source: "sefaria-merged",
    });
    return {
      id,
      text: leaf.text,
      source: "sefaria-merged",
      type: target.type,
      work: target.work,
      ref: leaf.ref,
      normalizedRef: leaf.normalizedRef,
      lang: "he",
      createdAt,
      versionTitle,
      license: parsed?.license,
      attribution: parsed?.attribution,
      url: parsed?.versionSource || parsed?.url,
    };
  });
}

