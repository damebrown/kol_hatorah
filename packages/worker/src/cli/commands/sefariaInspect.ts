import minimist from "minimist";
import fs from "fs/promises";
import path from "path";
import { getConfig, createLogger, TextType } from "@kol-hatorah/core";
import { FindResult, findHebrewMergedFile } from "../../sefariaLoader";

function flattenForInspect(node: any, work: string, type: TextType, pathParts: number[] = []): Array<{ ref: string; normalizedText: string }> {
  const out: Array<{ ref: string; normalizedText: string }> = [];
  if (Array.isArray(node)) {
    node.forEach((child, idx) => {
      out.push(...flattenForInspect(child, work, type, [...pathParts, idx + 1]));
    });
  } else if (typeof node === "string") {
    const t = node;
    if (t && t.trim()) {
      const ref =
        type === "tanakh"
          ? `${work} ${pathParts.join(":")}`
          : pathParts.length === 0
          ? work
          : pathParts.length === 1
          ? `${work} ${pathParts[0]}`
          : pathParts.length === 2
          ? `${work} ${pathParts[0]}:${pathParts[1]}`
          : `${work} ${pathParts.join(":")}`;
      out.push({ ref, normalizedText: t.replace(/<[^>]*>/g, "").trim() });
    }
  }
  return out;
}

export async function sefariaInspectCommand() {
  const argv = minimist(process.argv.slice(2));
  const work = argv.work || argv.w || "Genesis";
  const category = argv.category || argv.c || "tanakh";
  const customPath = argv.path || argv.p;

  const config = getConfig();
  const logger = createLogger(config);

  if (!config.sefariaExportPath) {
    logger.error("SEFARIA_EXPORT_PATH is not configured in .env. Cannot inspect Sefaria export.");
    process.exit(1);
  }

  const target = { work, type: category as TextType, categoryGuess: category as any };
  let findResult: FindResult;
  if (customPath) {
    findResult = { filePath: customPath, candidates: [] };
  } else {
    findResult = await findHebrewMergedFile(config.sefariaExportPath, target as any);
  }

  if (!findResult.filePath) {
    logger.error("Could not find a Hebrew/merged.(json|txt) JSON for the requested work under the specified category root.");
    if (findResult.candidates.length) {
      console.error("Closest candidates:");
      console.error(findResult.candidates.slice(0, 5).join("\n"));
    }
    console.error("Provide --path to override if needed.");
    process.exit(1);
  }

  const mergedPath = findResult.filePath;

  logger.info(`Inspecting file: ${mergedPath}`);
  try {
    const raw = await fs.readFile(mergedPath, "utf8");
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Failed to parse as JSON. First 200 chars:");
      console.log(raw.slice(0, 200));
      process.exit(1);
    }

    const title = parsed?.title;
    const language = parsed?.language;
    const versionTitle = parsed?.versionTitle;
    const versionSource = parsed?.versionSource;
    const text = parsed?.text;

    console.log({ title, language, versionTitle, versionSource });

    const shape: number[] = [];
    function inspectShape(node: any, depth = 0) {
      if (Array.isArray(node)) {
        shape[depth] = Math.max(shape[depth] || 0, node.length);
        if (node.length > 0) inspectShape(node[0], depth + 1);
      }
    }
    inspectShape(text);
    console.log("Shape (max sizes per level):", shape);

    const flattened = text ? flattenForInspect(text, work as string, target.type) : [];
    console.log("First 5 leaf segments (ref + preview):");
    flattened.slice(0, 5).forEach((seg) => {
      console.log({ ref: seg.ref, preview: seg.normalizedText.slice(0, 120) });
    });
  } catch (error) {
    logger.error({ error }, "Error inspecting file");
    process.exit(1);
  }
  process.exit(0);
}
