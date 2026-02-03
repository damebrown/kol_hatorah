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

function buildRef(work: string, pathParts: number[]): string {
  if (pathParts.length === 0) return work;
  if (pathParts.length === 1) return `${work} ${pathParts[0]}`;
  if (pathParts.length === 2) return `${work} ${pathParts[0]}:${pathParts[1]}`;
  return `${work} ${pathParts.join(":")}`;
}

function flattenVersionText(
  text: any,
  work: string,
  type: TextType,
  pathParts: number[] = []
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
  } else if (typeof text === "string") {
    const trimmed = text.trim();
    if (trimmed.length === 0) return out;
    const ref = buildRef(work, pathParts);
    out.push({
      text: trimmed,
      normalizedText: stripHtml(trimmed),
      ref,
      normalizedRef: ref,
    });
  }
  return out;
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

export const SLICE1_TARGETS: WorkTarget[] = [
  // Torah
  { type: "tanakh", work: "Genesis", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Exodus", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Leviticus", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Numbers", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Deuteronomy", categoryGuess: "Tanakh" },
  // Nevi'im (~50%)
  { type: "tanakh", work: "Joshua", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Judges", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Isaiah", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Kings", categoryGuess: "Tanakh" },
  // Ketuvim (~50%)
  { type: "tanakh", work: "Psalms", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Proverbs", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Job", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Ruth", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Esther", categoryGuess: "Tanakh" },
  { type: "tanakh", work: "Ecclesiastes", categoryGuess: "Tanakh" },
  // Mishnah (all base tractates; filtered by availability)
  { type: "mishnah", work: "Avot", categoryGuess: "Mishnah" },
  { type: "mishnah", work: "Berakhot", categoryGuess: "Mishnah" },
  { type: "mishnah", work: "Shabbat", categoryGuess: "Mishnah" },
  { type: "mishnah", work: "Sanhedrin", categoryGuess: "Mishnah" },
  // Bavli slice
  { type: "bavli", work: "Berakhot", categoryGuess: "Talmud/Bavli" },
  { type: "bavli", work: "Shabbat", categoryGuess: "Talmud/Bavli" },
  { type: "bavli", work: "Sanhedrin", categoryGuess: "Talmud/Bavli" },
];
