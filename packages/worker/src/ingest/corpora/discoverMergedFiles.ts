import type { Dirent } from "fs";
import fs from "fs/promises";
import path from "path";

/**
 * Skip descending into these **directory names** only (basename match).
 * Do not test the full path: e.g. `.../Rishonim/Guide.../Hebrew` must not match `Rishonim`
 * or we would never reach `Hebrew/merged.json`.
 */
const SKIP_DIR_BASENAME_RE = /^(Rishonim|Acharonim|Commentary|Guides|Modern Commentary|Targum|Onkelos)$/i;

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
        if (SKIP_DIR_BASENAME_RE.test(e.name)) continue;
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
