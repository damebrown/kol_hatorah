import type { Dirent } from "fs";
import fs from "fs/promises";
import path from "path";

/**
 * Skip descending into these directory names (basename match), UNLESS the full path contains
 * "Jewish Thought" — which hosts Moreh Nevuchim under Jewish Thought/Rishonim/...
 */
const SKIP_DIR_BASENAME_RE = /^(Rishonim|Acharonim|Commentary|Guides|Modern Commentary|Targum|Onkelos)$/i;

function shouldSkip(name: string, parentDir: string): boolean {
  if (!SKIP_DIR_BASENAME_RE.test(name)) return false;
  // Allow Rishonim under Jewish Thought (contains Moreh Nevuchim)
  if (name.toLowerCase() === "rishonim" && parentDir.replace(/\\/g, "/").includes("/Jewish Thought/")) return false;
  return true;
}

/**
 * Recursively find `Hebrew/merged.json` files under a directory (typical Sefaria export layout).
 */
export async function listHebrewMergedJsonUnder(absoluteRoot: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (shouldSkip(e.name, dir)) continue;
        await walk(full);
      } else if (e.name.toLowerCase() === "merged.json" && path.basename(path.dirname(full)) === "Hebrew") {
        out.push(full);
      }
    }
  }

  await walk(absoluteRoot);
  return out.sort();
}

export function relativePathUnderJson(sefariaExportRoot: string, absoluteFile: string): string {
  const jsonRoot = path.join(sefariaExportRoot, "json");
  return path.relative(jsonRoot, absoluteFile);
}
