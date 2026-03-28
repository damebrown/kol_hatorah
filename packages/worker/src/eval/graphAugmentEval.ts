import fs from "fs/promises";
import path from "path";
import { getConfig } from "@kol-hatorah/core";
import {
  askOnce,
  type AskOnceResult,
  type RagRetrievalEvalRefRow,
  type RagRetrievalEvalSnapshot,
} from "../cli/commands/ask";

/** 12 fixed Hebrew evaluation questions (Tanakh-focused). */
export const GRAPH_EVAL_QUESTIONS: string[] = [
  "איפה מופיע הרעיון שהעולם נברא בשביל התורה או בשביל ישראל, ואיך מפרשים אותו?",
  "מי דן במשמעות של “נעשה אדם בצלמנו כדמותנו”, ואילו כיוונים פרשניים עולים?",
  "איפה יש דיון בקשיות הלב של פרעה, ומה היחס בין בחירה להתערבות אלוהית?",
  "מהם המקורות על תשובה בתנ״ך ואיך חז״ל והפרשנים מפרשים אותם?",
  "איפה יש דיון במשמעות של “לא בשמים היא”, ואיך משתמשים בפסוק הזה?",
  "מי מפרש את עקידת יצחק מנקודת מבט של ניסיון מול ציווי?",
  "איפה בתנ״ך מופיע רעיון הרחמים במצוות, ואיך הפרשנים מתמודדים איתו?",
  "איפה מופיעים חלומות משמעותיים בתנ״ך ואיך מפרשים אותם?",
  "איפה מופיעים ערכים מוסריים לפני מתן תורה, ואיך חז״ל קושרים אותם?",
  "מי עוסק במשמעות של שתיקת אהרן אחרי מות בניו, ואילו קריאות שונות מוצעות?",
  "איפה בתנ״ך יש פער בין כוונה למעשה, ואיך הפרשנים מתייחסים לזה?",
  "איפה בתנ״ך מצווים על אהבת הגר, ואיך מפרשים את זה בפרשנות?",
];

export type HeuristicLabel = "likely improved" | "no clear change" | "possible degradation";

export interface PerQuestionEval {
  index: number;
  query: string;
  baseline: AskOnceResult;
  graph: AskOnceResult;
  label: HeuristicLabel;
  labelExplanation: string;
  baselineRefKeys: string[];
  graphRefKeys: string[];
  addedRefs: string[];
  removedRefs: string[];
  notes: string;
}

function refKey(r: RagRetrievalEvalRefRow): string {
  return `${r.work} :: ${r.normalizedRef}`;
}

function refDisplay(r: RagRetrievalEvalRefRow): string {
  return `${r.work} ${r.ref}`;
}

function poolKeys(snap: RagRetrievalEvalSnapshot | undefined): string[] {
  if (!snap?.contextPool?.length) return [];
  return snap.contextPool.map(refKey);
}

function poolRowsByKey(snap: RagRetrievalEvalSnapshot | undefined): Map<string, RagRetrievalEvalRefRow> {
  const m = new Map<string, RagRetrievalEvalRefRow>();
  if (!snap?.contextPool) return m;
  for (const row of snap.contextPool) m.set(refKey(row), row);
  return m;
}

function looksCommentaryRow(r: RagRetrievalEvalRefRow): boolean {
  if (r.type === "tanakh_commentary") return true;
  const w = r.work;
  return (
    /\bon\s+/i.test(w) ||
    /Rashi|Ramban|Ibn|Ezra|Tosafot|Or HaChaim|Sforno|Kli Yakar|Metzudat|Malbim|Chizkuni|Abarbanel/i.test(w)
  );
}

function typeDiversity(rows: RagRetrievalEvalRefRow[]): number {
  return new Set(rows.map((r) => r.type)).size;
}

function answersSimilar(a: string, b: string): boolean {
  const na = a.replace(/\s+/g, " ").trim();
  const nb = b.replace(/\s+/g, " ").trim();
  if (na === nb) return true;
  if (na.length < 40 && nb.length < 40) return na === nb;
  const shorter = Math.min(na.length, nb.length);
  const longer = Math.max(na.length, nb.length);
  if (shorter === 0) return longer === 0;
  let prefix = 0;
  const lim = Math.min(na.length, nb.length);
  for (let i = 0; i < lim; i++) {
    if (na[i] !== nb[i]) break;
    prefix++;
  }
  return prefix / shorter >= 0.92 && longer - shorter <= Math.ceil(shorter * 0.08);
}

function neighborLocalRefs(graphSnap: RagRetrievalEvalSnapshot | undefined): Set<string> {
  const s = new Set<string>();
  const added = graphSnap?.graphAugmentation?.addedNeighbors;
  if (!added) return s;
  for (const n of added) s.add(`${n.localRef}`);
  return s;
}

/**
 * Rule-based impact label (no LLM). Tuned for additive graph behavior vs. collateral loss.
 */
export function heuristicLabelForPair(baseline: AskOnceResult, graph: AskOnceResult): { label: HeuristicLabel; explanation: string; notes: string } {
  const bSnap = baseline.retrievalEval;
  const gSnap = graph.retrievalEval;
  const bKeys = new Set(poolKeys(bSnap));
  const gKeys = new Set(poolKeys(gSnap));
  const added = [...gKeys].filter((k) => !bKeys.has(k));
  const removed = [...bKeys].filter((k) => !gKeys.has(k));

  const bRows = bSnap?.contextPool ?? [];
  const gRows = gSnap?.contextPool ?? [];
  const divB = typeDiversity(bRows);
  const divG = typeDiversity(gRows);

  const graphAug = gSnap?.graphAugmentation;
  const neighborCount = graphAug?.addedNeighbors?.length ?? 0;
  const unmapped = graphAug?.unmappedNeighborRefs?.length ?? 0;

  const addedCommentary = added.some((k) => {
    const row = poolRowsByKey(gSnap).get(k);
    return row ? looksCommentaryRow(row) : false;
  });

  const rerankChanged =
    graphAug &&
    graphAug.rerankedTop.length > 0 &&
    graphAug.originalTop.length > 0 &&
    graphAug.rerankedTop.map((x) => x.ref).join("|") !== graphAug.originalTop.map((x) => x.ref).join("|");

  const crossLinkSignal =
    graphAug &&
    graphAug.signals.some((s) => s.linkSignalRaw > 0 || s.topicSignalRaw > 0 || s.commentaryBonus > 0);

  const notesParts: string[] = [];
  if (rerankChanged) notesParts.push("Graph reranked ref order vs. pre-graph pool.");
  if (neighborCount) notesParts.push(`${neighborCount} SQLite-backed neighbor(s) from Sefaria links.`);
  if (crossLinkSignal) notesParts.push("Non-zero link/topic/commentary graph signals in pool.");
  if (divG > divB) notesParts.push(`Corpus-type diversity ${divB}→${divG}.`);
  if (unmapped >= 4) notesParts.push(`Many unmapped Sefaria neighbor refs (${unmapped}); mapping gaps.`);

  let degradeScore = 0;
  let improveScore = 0;

  if (removed.length >= 2) degradeScore += 2;
  if (removed.length > added.length + 1) degradeScore += 2;
  if (added.length === 0 && neighborCount === 0 && rerankChanged && removed.length >= 1) degradeScore += 1;

  if (neighborCount > 0) improveScore += 2;
  if (added.length > 0 && removed.length <= 1) improveScore += 2;
  if (addedCommentary) improveScore += 2;
  if (divG > divB && added.length > 0) improveScore += 1;
  if (added.length > 0 && removed.length <= Math.ceil(added.length / 2)) improveScore += 1;

  if (unmapped >= 6 && neighborCount === 0) degradeScore += 1;

  const answerChanged = !answersSimilar(baseline.answer, graph.answer);
  if (answerChanged && improveScore > degradeScore) improveScore += 1;
  if (answerChanged && degradeScore > improveScore && removed.length >= 2) degradeScore += 1;

  if (degradeScore >= 4 && improveScore <= 2) {
    return {
      label: "possible degradation",
      explanation:
        "Multiple baseline sources dropped from the context pool and/or graph mode replaced more than it added; elevated risk of weaker context.",
      notes: notesParts.join(" "),
    };
  }

  if (improveScore >= 3 && degradeScore <= 2) {
    return {
      label: "likely improved",
      explanation:
        "Graph mode added neighbors and/or new sources with limited loss of baseline coverage, and/or increased commentary or corpus diversity.",
      notes: notesParts.join(" "),
    };
  }

  return {
    label: "no clear change",
    explanation: "Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.",
    notes: notesParts.join(" "),
  };
}

function fenceBlock(text: string): string {
  const safe = text.replace(/```/g, "``\\`");
  return "```\n" + safe + "\n```\n";
}

function formatRefList(rows: RagRetrievalEvalRefRow[] | undefined, label: string): string {
  if (!rows?.length) return `- *${label}:* (none)\n`;
  const lines = rows.map((r) => `- \`${refDisplay(r)}\` (score ${r.score.toFixed(4)}, type \`${r.type}\`)`);
  return `- *${label}:*\n${lines.map((l) => `  ${l}`).join("\n")}\n`;
}

function formatGraphDebugSection(snap: RagRetrievalEvalSnapshot | undefined): string {
  const g = snap?.graphAugmentation;
  if (!g) {
    return "- *Graph debug:* (not run or unavailable)\n";
  }
  let s = "- *Graph — original pool (pre-rerank):*\n";
  for (const o of g.originalTop) {
    s += `  - \`${o.ref}\` score ${o.score.toFixed(4)}\n`;
  }
  s += "- *Graph — reranked (graph score / retrieval score):*\n";
  for (const r of g.rerankedTop) {
    s += `  - \`${r.ref}\` graph ${r.graphScore.toFixed(4)} / vec ${r.retrievalScore.toFixed(4)}\n`;
  }
  s += "- *Graph — signals (per ref in pool before rerank):*\n";
  for (const sig of g.signals) {
    s +=
      `  - \`${sig.ref}\` links ${sig.linkSignalRaw}, topics ${sig.topicSignalRaw}, commentaryBonus ${sig.commentaryBonus}, weak ${sig.weakPenalty}, graphScore ${sig.finalScore.toFixed(4)}\n`;
  }
  if (g.addedNeighbors.length) {
    s += "- *Graph — expanded neighbors:*\n";
    for (const n of g.addedNeighbors) {
      s += `  - from \`${n.fromRef}\` → Sefaria \`${n.neighborSefariaRef}\` → local \`${n.localRef}\` (promptScore ${n.score.toFixed(4)})\n`;
    }
  }
  if (g.unmappedNeighborRefs.length) {
    s += `- *Graph — unmapped neighbor refs (sample):* ${g.unmappedNeighborRefs.slice(0, 8).map((x) => `\`${x}\``).join(", ")}\n`;
  }
  return s;
}

function reportPathDefault(): string {
  return path.join(__dirname, "../../../../eval/graph_augmented_retrieval_report.md");
}

export interface RunGraphAugmentEvalOptions {
  outPath?: string;
  limit?: number;
  onProgress?: (msg: string) => void;
}

export async function runGraphAugmentEval(opts: RunGraphAugmentEvalOptions = {}): Promise<string> {
  const outPath = opts.outPath ?? reportPathDefault();
  const limit = opts.limit ?? getConfig().rag.topK;
  const log = opts.onProgress ?? ((m: string) => console.error(m));

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const rows: PerQuestionEval[] = [];
  let qi = 0;
  for (const query of GRAPH_EVAL_QUESTIONS) {
    qi += 1;
    log(`[${qi}/12] baseline (graph off): ${query.slice(0, 48)}…`);
    process.env.KOL_HATORAH_ENABLE_SEFARIA_GRAPH = "0";
    const baseline = await askOnce({ query, limit, evalCapture: true, forceRag: true });

    log(`[${qi}/12] graph on: …`);
    process.env.KOL_HATORAH_ENABLE_SEFARIA_GRAPH = "1";
    const graph = await askOnce({ query, limit, evalCapture: true, forceRag: true });

    const { label, explanation, notes } = heuristicLabelForPair(baseline, graph);
    const bKeys = poolKeys(baseline.retrievalEval);
    const gKeys = poolKeys(graph.retrievalEval);
    const bSet = new Set(bKeys);
    const gSet = new Set(gKeys);
    const gByKey = poolRowsByKey(graph.retrievalEval);
    const bByKey = poolRowsByKey(baseline.retrievalEval);
    const addedRefs = gKeys.filter((k) => !bSet.has(k)).map((k) => {
      const row = gByKey.get(k);
      return row ? refDisplay(row) : k;
    });
    const removedRefs = bKeys.filter((k) => !gSet.has(k)).map((k) => {
      const row = bByKey.get(k);
      return row ? refDisplay(row) : k;
    });

    rows.push({
      index: qi,
      query,
      baseline,
      graph,
      label,
      labelExplanation: explanation,
      baselineRefKeys: bKeys,
      graphRefKeys: gKeys,
      addedRefs,
      removedRefs,
      notes,
    });
  }

  process.env.KOL_HATORAH_ENABLE_SEFARIA_GRAPH = "0";

  let md = `# Graph-augmented retrieval evaluation

Generated: ${new Date().toISOString()}

## How to read this report

- **Baseline:** \`KOL_HATORAH_ENABLE_SEFARIA_GRAPH=0\`
- **Graph:** \`KOL_HATORAH_ENABLE_SEFARIA_GRAPH=1\`
- **Vector top-k:** raw Qdrant hits before split expansion.
- **After expand split:** after \`expandSplitChunks\`, before graph.
- **Context pool:** order/scores passed to \`shouldAnswer\` / \`buildRagPrompt\`.
- **Heuristic labels** are rule-based only (see \`graphAugmentEval.ts\`).

---

`;

  const agg = {
    differentAnswers: 0,
    differentContextRefs: 0,
    gainedSources: 0,
    addedCommentators: 0,
    betterCrossLinking: 0,
    noClearChange: 0,
    possibleDegradation: 0,
  };

  for (const r of rows) {
    if (!answersSimilar(r.baseline.answer, r.graph.answer)) agg.differentAnswers += 1;
    if (r.baselineRefKeys.join("|") !== r.graphRefKeys.join("|")) agg.differentContextRefs += 1;
    if (r.addedRefs.length > 0) agg.gainedSources += 1;
    const neigh = neighborLocalRefs(r.graph.retrievalEval);
    const addedCommentary = r.addedRefs.some((disp) =>
      /Rashi|Ramban|Ibn|Ezra|Tosafot|Commentary| על | on /i.test(disp)
    );
    if (addedCommentary || neigh.size > 0) agg.addedCommentators += 1;
    const gdbg = r.graph.retrievalEval?.graphAugmentation;
    if (gdbg?.signals.some((s) => s.linkSignalRaw > 0 || s.topicSignalRaw > 0)) agg.betterCrossLinking += 1;
    if (r.label === "no clear change") agg.noClearChange += 1;
    if (r.label === "possible degradation") agg.possibleDegradation += 1;
  }

  for (const r of rows) {
    md += `### Question ${r.index}\n\n`;
    md += `- **Query:** ${r.query}\n`;
    md += `- **Heuristic label:** *${r.label}*\n`;
    md += `- **Why this label:** ${r.labelExplanation}\n`;
    md += `- **Notes on differences:** ${r.notes || "(none)"}\n\n`;
    md += `#### Baseline answer\n\n${fenceBlock(r.baseline.answer)}\n\n`;
    md += `#### Graph answer\n\n${fenceBlock(r.graph.answer)}\n\n`;
    md += `#### Baseline refs (context pool)\n\n`;
    md += r.baseline.retrievalEval?.contextPool?.map((x) => `- \`${refDisplay(x)}\``).join("\n") || "(none)";
    md += `\n\n#### Graph refs (context pool)\n\n`;
    md += r.graph.retrievalEval?.contextPool?.map((x) => `- \`${refDisplay(x)}\``).join("\n") || "(none)";
    md += `\n\n#### Added refs (graph vs baseline pool)\n\n`;
    md += r.addedRefs.length ? r.addedRefs.map((x) => `- \`${x}\``).join("\n") : "(none)";
    md += `\n\n#### Removed refs (baseline vs graph pool)\n\n`;
    md += r.removedRefs.length ? r.removedRefs.map((x) => `- \`${x}\``).join("\n") : "(none)";
    md += `\n\n#### Baseline — retrieval stages\n\n`;
    md += formatRefList(r.baseline.retrievalEval?.vectorTopK, "Vector top-k");
    md += formatRefList(r.baseline.retrievalEval?.afterExpandSplitChunks, "After expandSplitChunks");
    md += `\n#### Graph run — retrieval stages + graph internals\n\n`;
    md += formatRefList(r.graph.retrievalEval?.vectorTopK, "Vector top-k");
    md += formatRefList(r.graph.retrievalEval?.afterExpandSplitChunks, "After expandSplitChunks");
    md += formatGraphDebugSection(r.graph.retrievalEval);
    md += `\n---\n\n`;
  }

  md += `## Aggregate summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Questions with different final answers (heuristic text diff) | ${agg.differentAnswers} |\n`;
  md += `| Questions with different context-pool ref lists (ordered keys) | ${agg.differentContextRefs} |\n`;
  md += `| Questions that gained ≥1 new source in graph context pool | ${agg.gainedSources} |\n`;
  md += `| Questions with added commentary-looking ref or graph neighbor | ${agg.addedCommentators} |\n`;
  md += `| Questions where graph signals showed link/topic cohesion in pool | ${agg.betterCrossLinking} |\n`;
  md += `| Questions labeled *no clear change* | ${agg.noClearChange} |\n`;
  md += `| Questions labeled *possible degradation* | ${agg.possibleDegradation} |\n`;
  md += `| Questions labeled *likely improved* | ${rows.filter((x) => x.label === "likely improved").length} |\n`;

  md += `\n### Run again\n\n\`\`\`bash\nnpm --workspace packages/worker run eval:graph-augment\n\`\`\`\n\n`;
  md += `Output path: \`${outPath}\`\n`;

  await fs.writeFile(outPath, md, "utf8");
  return outPath;
}
