import fs from "fs/promises";
import minimist from "minimist";
import path from "path";
import { getConfig } from "@kol-hatorah/core";
import { askOnce } from "./ask";

export async function evalQueriesCommand() {
  const argv = minimist(process.argv.slice(2));
  const file = argv.file || argv.f || path.join(process.cwd(), "packages/worker/eval/queries.json");
  const limit = parseInt(argv.k || argv.limit || getConfig().rag.topK.toString(), 10);
  const outPath = argv.out || argv.o;

  let queries: Array<{ q: string; expectedRefs?: string[]; shouldRefuse?: boolean }> = [];
  try {
    const raw = await fs.readFile(file, "utf8");
    queries = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read queries file:", file, e);
    process.exit(1);
  }

  const results: any[] = [];
  for (const q of queries) {
    const started = Date.now();
    const res = await askOnce({ query: q.q, limit, jsonOutput: true });
    const latencyMs = Date.now() - started;

    let matchedRefs: string[] = [];
    if (q.expectedRefs && res.citations) {
      const citeSet = new Set(res.citations);
      matchedRefs = q.expectedRefs.filter((r) => citeSet.has(r));
    }

    results.push({
      query: q.q,
      expectedRefs: q.expectedRefs || [],
      shouldRefuse: q.shouldRefuse || false,
      refused: res.refused,
      answer: res.answer,
      citations: res.citations,
      usedChunks: res.usedChunks,
      model: res.model,
      tokens: res.tokens,
      latencyMs: res.latencyMs || latencyMs,
      matchedRefs,
    });
  }

  const report = { count: results.length, results };
  if (outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  process.exit(0);
}
