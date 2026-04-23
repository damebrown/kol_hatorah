import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { createQdrantClient, getConfig } from "@kol-hatorah/core";
import { getSQLiteManager } from "../src/storage/sqlite";

type ProbeRow = {
  inputRef: string;
  fixedRef: string;
  localFoundOnInput: boolean;
  localFoundOnFixed: boolean;
  resolvedRef: string | null;
  resolvedId: string | null;
  qdrantVectorFound: boolean;
  note: string;
};

const FAILING_REFS = [
  "Berakhot 2a:1",
  "Shabbat 31a:1",
  "Pesachim 10a:1",
  "Yoma 85b:1",
  "Megillah 7b:1",
  "Yevamot 62b:1",
  "Sotah 2a:1",
] as const;

function convertDafRefToNumeric(ref: string): string {
  const m = ref.match(/^(.+?)\s+(\d+)([ab]):(\d+)$/i);
  if (!m) return ref;
  const work = m[1]!;
  const daf = Number(m[2]);
  const amud = m[3]!.toLowerCase();
  const seg = Number(m[4]);
  const chapterLike = amud === "a" ? daf * 2 - 1 : daf * 2;
  return `${work} ${chapterLike}:${seg}`;
}

async function findSegmentByRef(ref: string): Promise<{ id: string; normalizedRef: string } | null> {
  const sqlite = await getSQLiteManager();
  const row = sqlite.db
    .prepare(
      `
        SELECT id, normalizedRef
        FROM segments
        WHERE type = 'bavli' AND (normalizedRef = ? OR ref = ?)
        ORDER BY CASE WHEN instr(id, '-') > 0 THEN 0 ELSE 1 END, id
        LIMIT 1
      `
    )
    .get(ref, ref) as { id: string; normalizedRef: string } | undefined;
  return row ?? null;
}

async function qdrantHasVector(id: string): Promise<boolean> {
  const cfg = getConfig();
  const client = createQdrantClient({ url: cfg.qdrant.url, apiKey: cfg.qdrant.apiKey });
  const collection = `${cfg.qdrant.collectionPrefix}_chunks_v2`;
  const rows = await client.retrieve(collection, { ids: [id], with_payload: false, with_vector: true });
  if (!rows.length) return false;
  const raw = rows[0]?.vector;
  if (Array.isArray(raw) && raw.length > 0) return true;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const v = Object.values(raw)[0];
    return Array.isArray(v) && v.length > 0;
  }
  return false;
}

async function main() {
  if (process.env.RUN_BAVLI_REF_SHAPE_PROBE !== "1") {
    console.log("bavliRefShapeFixProbe.test.ts skipped (set RUN_BAVLI_REF_SHAPE_PROBE=1 to run)");
    return;
  }

  const out: ProbeRow[] = [];
  for (const inputRef of FAILING_REFS) {
    const fixedRef = convertDafRefToNumeric(inputRef);
    const onInput = await findSegmentByRef(inputRef);
    const onFixed = await findSegmentByRef(fixedRef);
    const resolved = onInput ?? onFixed;
    const hasVec = resolved ? await qdrantHasVector(resolved.id) : false;
    out.push({
      inputRef,
      fixedRef,
      localFoundOnInput: Boolean(onInput),
      localFoundOnFixed: Boolean(onFixed),
      resolvedRef: resolved?.normalizedRef ?? null,
      resolvedId: resolved?.id ?? null,
      qdrantVectorFound: hasVec,
      note: onFixed && !onInput ? "Fixed shape resolved" : !resolved ? "Not ingested in local bavli set" : "Already resolved",
    });
  }

  const fixedResolved = out.filter((r) => r.localFoundOnFixed && !r.localFoundOnInput).length;
  const unresolved = out.filter((r) => !r.localFoundOnInput && !r.localFoundOnFixed).length;
  const reportPath = path.resolve(process.cwd(), "external/responses/bavli_ref_shape_fix_report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        testedRefs: FAILING_REFS.length,
        fixedResolved,
        unresolved,
        results: out,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(JSON.stringify({ testedRefs: FAILING_REFS.length, fixedResolved, unresolved, reportPath }, null, 2));
  assert.strictEqual(out.length, FAILING_REFS.length);
  console.log("bavliRefShapeFixProbe.test.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

