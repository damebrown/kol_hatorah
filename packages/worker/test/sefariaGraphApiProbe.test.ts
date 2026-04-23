import assert from "node:assert";
import { refToSefariaApiPath } from "../src/enrich/sefariaClient";

const SEFARIA_ORIGIN = "https://www.sefaria.org";

type ProbeResult = {
  ref: string;
  links: {
    url: string;
    ok: boolean;
    status: number;
    shape: string;
    length: number | null;
    error: string | null;
  };
  topics: {
    url: string;
    ok: boolean;
    status: number;
    shape: string;
    length: number | null;
    error: string | null;
  };
};

const REFS_FROM_LOGS = [
  "Birkat Asher on Torah Numbers 15:0",
  "Karati Bekhol Lev Beha'alotcha 0:4",
  "Riva on Torah Exodus 24:37",
  "Guide for the Perplexed, Part 1 61:4",
  "Genesis 1:1",
];

async function fetchJson(url: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(url);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
}

function shapeOf(v: unknown): string {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

async function probeRef(ref: string): Promise<ProbeResult> {
  const apiPath = refToSefariaApiPath(ref);
  const linksUrl = `${SEFARIA_ORIGIN}/api/links/${apiPath}`;
  const topicsUrl = `${SEFARIA_ORIGIN}/api/ref-topic-links/${apiPath}?interface_lang=english`;

  const [linksRes, topicsRes] = await Promise.all([fetchJson(linksUrl), fetchJson(topicsUrl)]);

  const linksBody = linksRes.body;
  const topicsBody = topicsRes.body;

  const linksShape = shapeOf(linksBody);
  const topicsShape = shapeOf(topicsBody);

  const linksError =
    linksBody && typeof linksBody === "object" && "error" in linksBody
      ? String((linksBody as { error?: unknown }).error ?? "")
      : null;
  const topicsError =
    topicsBody && typeof topicsBody === "object" && "error" in topicsBody
      ? String((topicsBody as { error?: unknown }).error ?? "")
      : null;

  return {
    ref,
    links: {
      url: linksUrl,
      ok: linksRes.ok,
      status: linksRes.status,
      shape: linksShape,
      length: Array.isArray(linksBody) ? linksBody.length : null,
      error: linksError,
    },
    topics: {
      url: topicsUrl,
      ok: topicsRes.ok,
      status: topicsRes.status,
      shape: topicsShape,
      length: Array.isArray(topicsBody) ? topicsBody.length : null,
      error: topicsError,
    },
  };
}

async function main() {
  const results: ProbeResult[] = [];
  for (const ref of REFS_FROM_LOGS) {
    results.push(await probeRef(ref));
  }

  console.log(JSON.stringify({ testedRefs: REFS_FROM_LOGS.length, results }, null, 2));

  assert.strictEqual(results.length, REFS_FROM_LOGS.length);
  console.log("sefariaGraphApiProbe.test.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
