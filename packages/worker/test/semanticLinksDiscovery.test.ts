import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { createQdrantClient, getConfig, type Chunk } from "@kol-hatorah/core";
import pLimit from "p-limit";
import { fetchSefariaLinks } from "../src/enrich/sefariaClient";
import { getSQLiteManager } from "../src/storage/sqlite";

type BaseSegment = {
  id: string;
  type: string;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: string;
};

type DiscoveryRow = {
  inputRef: string;
  localMatch: {
    id: string;
    type: string;
    work: string;
    ref: string;
    normalizedRef: string;
    lang: string;
  } | null;
  linksCount: number;
  qdrantK: number;
  semanticNeighborsScanned: number;
  semanticNewLinks: Array<{ ref: string; score: number; type: string; work: string }>;
  semanticScoreStats: { min: number | null; max: number | null; avg: number | null };
  apiTop10ScoreStats: {
    sampledLinks: number;
    checkedLinks: number;
    vectorsFound: number;
    vectorsMissing: number;
    skippedCommentaryOrFiltered: number;
    missingInLocalDb: number;
    min: number | null;
    max: number | null;
    avg: number | null;
  };
  semanticLinkTypeCounts: Record<string, number>;
  notes: string[];
};

const TEST_REFS = [
  // Tanakh (16)
  "Genesis 1:1",
  "Genesis 22:2",
  "Exodus 3:14",
  "Exodus 20:2",
  "Leviticus 19:18",
  "Numbers 6:24",
  "Deuteronomy 6:4",
  "Deuteronomy 30:19",
  "Isaiah 1:16",
  "Isaiah 53:1",
  "Psalms 23:1",
  "Proverbs 3:6",
  "Obadiah 1:2",
  "Nahum 2:1",
  "Haggai 2:8",
  "Zephaniah 3:9",
  // Mishnah (10)
  "Mishnah Berakhot 1:1",
  "Mishnah Berakhot 9:5",
  "Mishnah Avot 1:1",
  "Mishnah Avot 3:14",
  "Mishnah Sanhedrin 4:5",
  "Mishnah Sotah 1:1",
  "Mishnah Peah 1:1",
  "Mishnah Makkot 3:16",
  "Mishnah Chullin 7:6",
  "Mishnah Middot 2:5",
  // Bavli (10)
  "Berakhot 2a:1",
  "Shabbat 31a:1",
  "Pesachim 10a:1",
  "Yoma 85b:1",
  "Megillah 7b:1",
  "Yevamot 62b:1",
  "Sotah 2a:1",
  "Bava Kamma 2a:1",
  "Sanhedrin 37a:1",
  "Menachot 43b:1",
  // Moreh (4)
  "Guide for the Perplexed, Part 1 1:1",
  "Guide for the Perplexed, Part 1 1:9",
  "Guide for the Perplexed, Part 1 61:4",
  "Guide for the Perplexed, Part 2 30:2",
] as const;

function normalizeComparableRef(ref: string): string {
  return ref.trim().replace(/\s+/g, " ").replace(/\.$/, "").toLowerCase();
}

function isCommentaryLike(chunk: { type?: string; work?: string }): boolean {
const t = (chunk.type || "").toLowerCase();
  if (t.includes("commentary")) return true;
  const w = (chunk.work || "").toLowerCase();
  return w.includes("commentary");
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    const av = a[i]!;
    const bv = b[i]!;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function scoreStats(scores: number[]): { min: number | null; max: number | null; avg: number | null } {
  if (scores.length === 0) return { min: null, max: null, avg: null };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  for (const s of scores) {
    if (s < min) min = s;
    if (s > max) max = s;
    sum += s;
  }
  return { min, max, avg: sum / scores.length };
}

function countStats(values: number[]): { min: number; max: number; avg: number } {
  if (values.length === 0) return { min: 0, max: 0, avg: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { min, max, avg: sum / values.length };
}

function dbRefCandidates(ref: string): string[] {
  const out: string[] = [];
  const add = (v: string) => {
    const t = v.trim();
    if (t.length > 0 && !out.includes(t)) out.push(t);
  };
  const bavliDafMatch = ref.match(/^(.+?)\s+(\d+)([ab]):(\d+)$/i);
  if (bavliDafMatch) {
    const work = bavliDafMatch[1]!;
    const daf = Number(bavliDafMatch[2]);
    const amud = bavliDafMatch[3]!.toLowerCase();
    const seg = Number(bavliDafMatch[4]);
    const chapterLike = amud === "a" ? daf * 2 - 1 : daf * 2;
    add(`${work} ${chapterLike}:${seg}`);
  }
  add(ref);
  if (/^Mishnah\s+/i.test(ref)) add(ref.replace(/^Mishnah\s+/i, ""));
  return out;
}

async function resolveBaseSegment(ref: string): Promise<BaseSegment | null> {
  const sqlite = await getSQLiteManager();
  const stmt = sqlite.db.prepare(
    `
      SELECT id, type, work, ref, normalizedRef, lang
      FROM segments
      WHERE (normalizedRef = ? OR ref = ?)
        AND type IN ('tanakh','mishnah','bavli','philosophy')
      ORDER BY CASE WHEN lang = 'he' THEN 0 ELSE 1 END,
               CASE WHEN instr(id, '-') > 0 THEN 0 ELSE 1 END,
               id
      LIMIT 1
    `
  );
  for (const cand of dbRefCandidates(ref)) {
    const row = stmt.get(cand, cand) as BaseSegment | undefined;
    if (row) return row;
  }
  return null;
}

async function resolveIngestedNonCommentarySegment(ref: string): Promise<BaseSegment | null> {
  const sqlite = await getSQLiteManager();
  const stmt = sqlite.db.prepare(
    `
      SELECT id, type, work, ref, normalizedRef, lang
      FROM segments
      WHERE (normalizedRef = ? OR ref = ?)
        AND lower(type) NOT LIKE '%commentary%'
      ORDER BY CASE WHEN lang = 'he' THEN 0 ELSE 1 END,
               CASE WHEN instr(id, '-') > 0 THEN 0 ELSE 1 END,
               id
      LIMIT 1
    `
  );
  for (const cand of dbRefCandidates(ref)) {
    const row = stmt.get(cand, cand) as BaseSegment | undefined;
    if (row) return row;
  }
  return null;
}

async function qdrantVectorForId(
  client: ReturnType<typeof createQdrantClient>,
  collectionName: string,
  id: string
): Promise<number[] | null> {
  const points = await client.retrieve(collectionName, {
    ids: [id],
    with_payload: false,
    with_vector: true,
  });
  if (!points || points.length === 0) return null;
  const raw = points[0]?.vector;
  if (Array.isArray(raw) && raw.every((n) => typeof n === "number")) return raw as number[];
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const first = Object.values(raw)[0];
    if (Array.isArray(first) && first.every((n) => typeof n === "number")) return first as number[];
  }
  return null;
}

async function qdrantVectorForRef(
  client: ReturnType<typeof createQdrantClient>,
  collectionName: string,
  ref: string
): Promise<number[] | null> {
  const norm = ref.trim().replace(/\s+/g, " ");
  const scanned = await client.scroll(collectionName, {
    limit: 10,
    with_payload: true,
    with_vector: true,
    filter: {
      should: [
        { must: [{ key: "normalizedRef", match: { value: norm } }] },
        { must: [{ key: "ref", match: { value: norm } }] },
      ],
    },
  });
  const points = scanned.points ?? [];
  for (const p of points) {
    const raw = p.vector;
    if (Array.isArray(raw) && raw.every((n) => typeof n === "number")) return raw as number[];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const first = Object.values(raw)[0];
      if (Array.isArray(first) && first.every((n) => typeof n === "number")) return first as number[];
    }
  }
  return null;
}

function isQdrantTimeoutError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("aborted") || msg.includes("timeout") || msg.includes("QdrantClientTimeoutError");
}

async function qdrantSearchWithRetry(
  client: ReturnType<typeof createQdrantClient>,
  collectionName: string,
  args: Parameters<typeof client.search>[1],
  opts: { maxAttempts: number; refLabel: string; idx: number; total: number }
) {
  let attempt = 1;
  while (true) {
    try {
      return await client.search(collectionName, args);
    } catch (err) {
      if (attempt >= opts.maxAttempts || !isQdrantTimeoutError(err)) throw err;
      const waitMs = 800 * Math.pow(2, attempt - 1);
      console.warn(
        `[${opts.idx}/${opts.total}] Qdrant search timeout for ${opts.refLabel}, retry ${attempt}/${opts.maxAttempts} in ${waitMs}ms`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      attempt += 1;
    }
  }
}

async function main() {
  if (process.env.RUN_SEMANTIC_LINKS_DISCOVERY !== "1") {
    console.log("semanticLinksDiscovery.test.ts skipped (set RUN_SEMANTIC_LINKS_DISCOVERY=1 to run)");
    return;
  }

  const config = getConfig();
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;
  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  const out: DiscoveryRow[] = [];
  const resultsByIndex: Array<DiscoveryRow | undefined> = Array(TEST_REFS.length).fill(undefined);
  let cumulativeSemanticNewLinks = 0;
  let cumulativeApiVectorsFound = 0;
  let cumulativeLinksChecked = 0;
  let cumulativeMissingSourceVectors = 0;
  const reportPath = path.resolve(process.cwd(), "external/responses/semantic_links_discovery_report.json");
  const checkpointPath = path.resolve(process.cwd(), "external/responses/semantic_links_discovery_checkpoint.json");
  let writeQueue: Promise<void> = Promise.resolve();

  function summaryFor(rows: DiscoveryRow[]) {
    const successfulRefTests = rows.filter(
      (r) => r.localMatch !== null && !r.notes.includes("Could not read source vector from Qdrant for this ref id.") && r.linksCount > 0
    ).length;
    return {
      successfulRefTests,
      discoveredLinksAcrossRefs: countStats(rows.map((r) => r.semanticNewLinks.length)),
      semanticScoreAcrossAllNewLinks: scoreStats(rows.flatMap((r) => r.semanticNewLinks.map((x) => x.score))),
    };
  }

  async function writeCheckpoint() {
    const completed = resultsByIndex.filter((r): r is DiscoveryRow => Boolean(r));
    const payload = {
      generatedAt: new Date().toISOString(),
      collectionName,
      refsTested: TEST_REFS.length,
      refsCompleted: completed.length,
      summary: summaryFor(completed),
      results: completed,
    };
    writeQueue = writeQueue.then(async () => {
      await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
      await fs.writeFile(checkpointPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    });
    await writeQueue;
  }

  const concurrency = Math.max(1, Number(process.env.SEMANTIC_LINKS_CONCURRENCY ?? "6"));
  const limit = pLimit(concurrency);
  console.log(`Running semantic discovery with concurrency=${concurrency}`);

  const tasks = TEST_REFS.map((inputRef, idx) =>
    limit(async () => {
    console.log(`[${new Date().toISOString()}] [${idx + 1}/${TEST_REFS.length}] START ${inputRef}`);
    const notes: string[] = [];
    const base = await resolveBaseSegment(inputRef);
    if (!base) {
      console.log(`[${idx + 1}/${TEST_REFS.length}] local segment not found in SQLite`);
      const row: DiscoveryRow = {
        inputRef,
        localMatch: null,
        linksCount: 0,
        qdrantK: 0,
        semanticNeighborsScanned: 0,
        semanticNewLinks: [],
        semanticScoreStats: { min: null, max: null, avg: null },
        apiTop10ScoreStats: {
          sampledLinks: 0,
          checkedLinks: 0,
          vectorsFound: 0,
          vectorsMissing: 0,
          skippedCommentaryOrFiltered: 0,
          missingInLocalDb: 0,
          min: null,
          max: null,
          avg: null,
        },
        semanticLinkTypeCounts: {},
        notes: ["No matching local segment found in SQLite."],
      };
      resultsByIndex[idx] = row;
      await writeCheckpoint();
      return row;
    }

    const links = await fetchSefariaLinks(inputRef);
    console.log(`[${idx + 1}/${TEST_REFS.length}] links fetched: ${links.length}`);
    const linksSet = new Set(links.map((l) => normalizeComparableRef(l.toRef)));
    const selfRefKeys = new Set(
      [inputRef, ...dbRefCandidates(inputRef), base.ref, base.normalizedRef].map((r) => normalizeComparableRef(r))
    );

    let sourceVec = await qdrantVectorForId(client, collectionName, base.id);
    if (!sourceVec) sourceVec = await qdrantVectorForRef(client, collectionName, base.normalizedRef || base.ref);
    if (!sourceVec) {
      console.log(`[${idx + 1}/${TEST_REFS.length}] source vector missing in Qdrant (id/ref fallback failed)`);
      cumulativeMissingSourceVectors += 1;
      const row: DiscoveryRow = {
        inputRef,
        localMatch: base,
        linksCount: links.length,
        qdrantK: 0,
        semanticNeighborsScanned: 0,
        semanticNewLinks: [],
        semanticScoreStats: { min: null, max: null, avg: null },
        apiTop10ScoreStats: {
          sampledLinks: Math.min(10, links.length),
          checkedLinks: Math.min(10, links.length),
          vectorsFound: 0,
          vectorsMissing: Math.min(10, links.length),
          skippedCommentaryOrFiltered: 0,
          missingInLocalDb: 0,
          min: null,
          max: null,
          avg: null,
        },
        semanticLinkTypeCounts: {},
        notes: ["Could not read source vector from Qdrant for this ref id."],
      };
      resultsByIndex[idx] = row;
      await writeCheckpoint();
      return row;
    }

    const k = Math.min(Math.ceil(links.length * 0.15), 30);
    const qdrantLimit = k > 0 ? Math.max(5, k * 3) : 0;
    console.log(`[${idx + 1}/${TEST_REFS.length}] semantic target K=${k}, qdrantLimit=${qdrantLimit}`);
    const raw =
      qdrantLimit > 0
        ? await qdrantSearchWithRetry(
            client,
            collectionName,
            {
            vector: sourceVec,
            limit: qdrantLimit,
            with_payload: true,
            filter: {
              must_not: [{ key: "type", match: { value: "tanakh_commentary" } }],
            },
            },
            { maxAttempts: 4, refLabel: inputRef, idx: idx + 1, total: TEST_REFS.length }
          )
        : [];

    const semanticNewLinks: Array<{ ref: string; score: number; type: string; work: string }> = [];
    const semanticTypeCounts: Record<string, number> = {};
    const seen = new Set<string>();
    let scanned = 0;
    for (const p of raw) {
      const payload = (p.payload || {}) as Partial<Chunk>;
      if (!payload.ref || !payload.type || !payload.work) continue;
      scanned += 1;

      if (isCommentaryLike({ type: payload.type, work: payload.work })) continue;
      if (payload.id === base.id) continue;

      const key = normalizeComparableRef(payload.normalizedRef || payload.ref);
      if (selfRefKeys.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);

      if (linksSet.has(key)) continue;

      semanticNewLinks.push({
        ref: payload.normalizedRef || payload.ref,
        score: typeof p.score === "number" ? p.score : 0,
        type: payload.type,
        work: payload.work,
      });
      semanticTypeCounts[payload.type] = (semanticTypeCounts[payload.type] ?? 0) + 1;
      if (semanticNewLinks.length >= k) break;
    }
    console.log(
      `[${idx + 1}/${TEST_REFS.length}] semantic new links: ${semanticNewLinks.length}, neighbors scanned: ${scanned}`
    );

    semanticNewLinks.sort((a, b) => b.score - a.score);
    const semanticScores = semanticNewLinks.map((x) => x.score);

    // Compare source vector with the first 10 API /links refs that are ingested and have vectors.
    const apiTop10: string[] = [];
    const apiScores: number[] = [];
    let checkedLinks = 0;
    let apiVectorsFound = 0;
    let apiVectorsMissing = 0;
    let skippedCommentaryOrFiltered = 0;
    let missingInLocalDb = 0;
    for (const l of links) {
      if (apiTop10.length >= 10) break;
      const linkRef = l.toRef;
      checkedLinks += 1;
      const linkedSeg = await resolveIngestedNonCommentarySegment(linkRef);
      if (!linkedSeg) {
        missingInLocalDb += 1;
        continue;
      }
      if (isCommentaryLike({ type: linkedSeg.type, work: linkedSeg.work })) {
        skippedCommentaryOrFiltered += 1;
        continue;
      }
      const linkedVec = await qdrantVectorForId(client, collectionName, linkedSeg.id);
      if (!linkedVec) {
        apiVectorsMissing += 1;
        continue;
      }
      apiVectorsFound += 1;
      apiTop10.push(linkRef);
      apiScores.push(cosineSimilarity(sourceVec, linkedVec));
      if (apiTop10.length % 5 === 0 || apiTop10.length === 10) {
        console.log(
          `[${idx + 1}/${TEST_REFS.length}] api-link vectors collected: ${apiTop10.length}/10 (checked=${checkedLinks})`
        );
      }
    }

    if (semanticNewLinks.length === 0) {
      notes.push("No semantic-only links found at configured K.");
    }

    const row: DiscoveryRow = {
      inputRef,
      localMatch: base,
      linksCount: links.length,
      qdrantK: k,
      semanticNeighborsScanned: scanned,
      semanticNewLinks,
      semanticScoreStats: scoreStats(semanticScores),
      apiTop10ScoreStats: {
        sampledLinks: apiTop10.length,
        checkedLinks,
        vectorsFound: apiVectorsFound,
        vectorsMissing: apiVectorsMissing,
        skippedCommentaryOrFiltered,
        missingInLocalDb,
        ...scoreStats(apiScores),
      },
      semanticLinkTypeCounts: semanticTypeCounts,
      notes,
    };
    cumulativeSemanticNewLinks += semanticNewLinks.length;
    cumulativeApiVectorsFound += apiVectorsFound;
    cumulativeLinksChecked += checkedLinks;
    console.log(
      `[${idx + 1}/${TEST_REFS.length}] DONE semantic=${semanticNewLinks.length} apiVectors=${apiVectorsFound} checked=${checkedLinks}` +
        ` | cumulative semantic=${cumulativeSemanticNewLinks} apiVectors=${cumulativeApiVectorsFound}` +
        ` checked=${cumulativeLinksChecked} missingSourceVec=${cumulativeMissingSourceVectors}`
    );
    resultsByIndex[idx] = row;
    await writeCheckpoint();
    return row;
    })
  );

  const rows = await Promise.all(tasks);
  out.push(...rows);

  // Ensure checkpoint is complete even if incremental writes lagged behind during concurrency.
  await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
  await fs.writeFile(
    checkpointPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        collectionName,
        refsTested: TEST_REFS.length,
        refsCompleted: out.length,
        summary: summaryFor(out),
        results: out,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const discoveredRefs = out.filter((r) => r.semanticNewLinks.length > 0).length;
  const totalNewLinks = out.reduce((sum, r) => sum + r.semanticNewLinks.length, 0);
  const sourceVectorMissingRefs = out
    .filter((r) => r.notes.includes("Could not read source vector from Qdrant for this ref id."))
    .map((r) => r.inputRef);
  const summary = summaryFor(out);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        collectionName,
        refsTested: TEST_REFS.length,
        summary,
        results: out,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        refsTested: TEST_REFS.length,
        refsWithNewSemanticLinks: discoveredRefs,
        totalNewSemanticLinks: totalNewLinks,
        sourceVectorMissingCount: sourceVectorMissingRefs.length,
        sourceVectorMissingRefs,
        summary,
        reportPath,
      },
      null,
      2
    )
  );

  assert.strictEqual(out.length, TEST_REFS.length);
  console.log("semanticLinksDiscovery.test.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
