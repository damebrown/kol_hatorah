/**
 * Dev/test runner: inspect a commentary merged.json file.
 * Prints total leaf count, first 3 refs + preview, sectionPaths.
 *
 * Usage:
 *   npx tsx src/dev/inspectCommentary.ts [--path <path>]
 *   npm run dev:inspect-commentary -- --path "Rishonim on Tanakh/Rashi/Torah/Rashi on Leviticus/Hebrew/merged.json"
 */

import path from "path";
import fs from "fs/promises";
import { getConfig } from "@kol-hatorah/core";
import { flattenMergedExportText } from "../sefariaLoader";

const DEFAULT_SAMPLE =
  "Rishonim on Tanakh/Rashi/Torah/Rashi on Leviticus/Hebrew/merged.json";

async function main() {
  const pathArg = process.argv.includes("--path")
    ? process.argv[process.argv.indexOf("--path") + 1]
    : DEFAULT_SAMPLE;

  const config = getConfig();
  if (!config.sefariaExportPath) {
    console.error("SEFARIA_EXPORT_PATH not configured.");
    process.exit(1);
  }

  const tanakhRoot = path.join(config.sefariaExportPath, "json", "Tanakh");
  const absPath = path.isAbsolute(pathArg)
    ? pathArg
    : path.join(tanakhRoot, pathArg.split("/").join(path.sep));

  const relPath = path.relative(tanakhRoot, absPath).replace(/\\/g, "/");

  let parsed: any;
  try {
    const raw = await fs.readFile(absPath, "utf8");
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read/parse:", err);
    process.exit(1);
  }

  const title = parsed?.title ?? "Unknown";
  const text = parsed?.text;
  if (!text) {
    console.error("No text in file.");
    process.exit(1);
  }

  const leaves = flattenMergedExportText(title, text);

  console.log("--- Commentary inspection ---");
  console.log("file:", relPath);
  console.log("title:", title);
  console.log("total leaf count:", leaves.length);
  console.log("");
  console.log("First 3 refs + preview (120 chars):");

  for (let i = 0; i < Math.min(3, leaves.length); i++) {
    const leaf = leaves[i];
    const preview = leaf.text.slice(0, 120) + (leaf.text.length > 120 ? "..." : "");
    console.log(`  [${i + 1}] ref: ${leaf.ref}`);
    console.log(`      preview: ${preview}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
