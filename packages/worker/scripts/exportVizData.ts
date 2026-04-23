/**
 * Fetches vectors from Qdrant, reduces to 3D via PCA (power iteration),
 * and writes viz/data.json for the browser visualization.
 *
 * Usage:
 *   npx tsx packages/worker/scripts/exportVizData.ts [--limit 3000]
 */
import fs from "node:fs";
import path from "node:path";
import { getConfig, createQdrantClient } from "@kol-hatorah/core";

const REPO_ROOT = path.resolve(__dirname, "../../../");
const OUT_PATH = path.join(REPO_ROOT, "viz", "data.js");

// ─── PCA via randomized power iteration ──────────────────────────────────────

function dot(a: Float64Array, b: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(v: Float64Array): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: Float64Array): Float64Array {
  const n = norm(v);
  const out = new Float64Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

/** Multiply X (n×d) by v (d), return n-vector. */
function matVec(X: Float64Array[], v: Float64Array): Float64Array {
  const out = new Float64Array(X.length);
  for (let i = 0; i < X.length; i++) out[i] = dot(X[i], v);
  return out;
}

/** Multiply X^T (d×n) by u (n), return d-vector. */
function matTVec(X: Float64Array[], u: Float64Array, d: number): Float64Array {
  const out = new Float64Array(d);
  for (let i = 0; i < X.length; i++) {
    const ui = u[i];
    const xi = X[i];
    for (let j = 0; j < d; j++) out[j] += ui * xi[j];
  }
  return out;
}

/**
 * Randomized PCA — extracts top-k components via power iteration with deflation.
 * Returns n×k projection matrix as k arrays of length n.
 */
function pca(rawVectors: number[][], k: number, iterations = 60): number[][] {
  const n = rawVectors.length;
  const d = rawVectors[0].length;

  // Center
  const mean = new Float64Array(d);
  for (const row of rawVectors) {
    for (let j = 0; j < d; j++) mean[j] += row[j] / n;
  }
  const X: Float64Array[] = rawVectors.map((row) => {
    const r = new Float64Array(d);
    for (let j = 0; j < d; j++) r[j] = row[j] - mean[j];
    return r;
  });

  const components: number[][] = [];

  for (let comp = 0; comp < k; comp++) {
    // Random init
    let v = new Float64Array(d);
    for (let j = 0; j < d; j++) v[j] = Math.random() - 0.5;
    v = normalize(v);

    // Power iteration: v ← X^T(Xv), normalize
    for (let iter = 0; iter < iterations; iter++) {
      const Xv = matVec(X, v);
      v = normalize(matTVec(X, Xv, d));
    }

    // Projection scores for each point
    const scores = matVec(X, v);
    components.push(Array.from(scores));

    // Deflate: X_i -= score_i * v^T (remove this component)
    for (let i = 0; i < n; i++) {
      const s = scores[i];
      const xi = X[i];
      for (let j = 0; j < d; j++) xi[j] -= s * v[j];
    }

    console.log(`  Component ${comp + 1}/${k} done`);
  }

  return components; // k arrays, each length n
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const SAMPLE_LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 3000;

  const config = getConfig();
  const collectionName = `${config.qdrant.collectionPrefix}_chunks_v2`;

  console.log(`Connecting to Qdrant: ${config.qdrant.url}`);
  console.log(`Collection: ${collectionName}`);
  console.log(`Sample limit: ${SAMPLE_LIMIT}`);

  const client = createQdrantClient({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
    timeout: 120_000,
  });

  // Count per type so we can allocate a fair quota to each
  const ALL_TYPES = ["tanakh", "mishnah", "bavli", "tanakh_commentary", "midrash", "philosophy", "halacha", "liturgy"] as const;
  const typeCounts: Record<string, number> = {};
  for (const t of ALL_TYPES) {
    const r = await client.count(collectionName, { filter: { must: [{ key: "type", match: { value: t } }] }, exact: false });
    typeCounts[t] = r.count;
    if (r.count > 0) console.log(`  ${t.padEnd(22)} ${r.count.toLocaleString()}`);
  }

  // Stratified sampling: each non-empty type gets an equal share of SAMPLE_LIMIT
  const activeTypes = ALL_TYPES.filter((t) => typeCounts[t] > 0);
  const quotaPerType = Math.floor(SAMPLE_LIMIT / activeTypes.length);

  console.log(`\nStratified sampling: ${quotaPerType} points per type (${activeTypes.length} types)`);

  const payloads: Record<string, unknown>[] = [];
  const vectors: number[][] = [];
  const PAGE_SIZE = 100;

  for (const t of activeTypes) {
    const typeQuota = Math.min(quotaPerType, typeCounts[t]);
    let fetched = 0;
    let offset: string | number | null | undefined = undefined;

    while (fetched < typeQuota) {
      const batchSize = Math.min(PAGE_SIZE, typeQuota - fetched);
      const res = await client.scroll(collectionName, {
        filter: { must: [{ key: "type", match: { value: t } }] },
        limit: batchSize,
        offset,
        with_payload: true,
        with_vector: true,
      });

      for (const point of res.points) {
        if (point.vector && Array.isArray(point.vector)) {
          payloads.push(point.payload as Record<string, unknown>);
          vectors.push(point.vector as number[]);
          fetched++;
        }
      }

      offset = res.next_page_offset;
      if (offset == null) break;
    }

    console.log(`  ${t.padEnd(22)} fetched ${fetched}`);
  }

  if (vectors.length < 3) {
    throw new Error("Not enough vectors for PCA.");
  }

  // PCA → 3D
  console.log("Running PCA (3 components)...");
  const [pc1, pc2, pc3] = pca(vectors, 3);

  // Assemble output
  const points = payloads.map((p, i) => ({
    x: +pc1[i].toFixed(4),
    y: +pc2[i].toFixed(4),
    z: +pc3[i].toFixed(4),
    type: p.type,
    work: p.work,
    ref: p.ref,
    heRef: p.heRef,
    text: typeof p.text === "string" ? p.text.slice(0, 120) : "",
    lang: p.lang,
  }));

  fs.writeFileSync(OUT_PATH, `window.VIZ_DATA = ${JSON.stringify(points)};`);
  console.log(`\nWrote ${points.length} points → ${OUT_PATH}`);
  console.log(`\nOpen viz/index.html in your browser to view.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
