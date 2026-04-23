/**
 * B0 — Pre-ingest ref format validation
 *
 * Sends 5 sample refs per corpus through the Sefaria Name API and verifies
 * they resolve to valid refs. Fails with exit code 1 if >20% of any corpus's
 * probes fail.
 *
 * Usage:
 *   npx tsx packages/worker/scripts/validateRefs.ts [--corpus <id>]
 */

const SEFARIA_NAME_API = "https://www.sefaria.org/api/name";

interface NameResult {
  ref?: string;
  is_ref?: boolean;
  type?: string;
}

async function probeRef(ref: string): Promise<{ ok: boolean; resolved?: string; error?: string }> {
  const url = `${SEFARIA_NAME_API}/${encodeURIComponent(ref)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const j = (await res.json()) as NameResult;
    if (j?.is_ref && j.ref) return { ok: true, resolved: j.ref };
    return { ok: false, error: `is_ref=false type=${j?.type ?? "?"}` };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

interface CorpusProbe {
  corpus: string;
  refs: string[];
}

const CORPUS_PROBES: CorpusProbe[] = [
  {
    corpus: "tanakh",
    refs: [
      "Genesis 1:1",
      "Exodus 20:2",
      "Psalms 1:1",
      "Isaiah 6:3",
      "Deuteronomy 6:4",
    ],
  },
  {
    corpus: "mishnah",
    refs: [
      "Mishnah Berakhot 1:1",
      "Mishnah Shabbat 1:1",
      "Mishnah Sanhedrin 4:5",
      "Mishnah Avot 1:1",
      "Mishnah Bava Kamma 1:1",
    ],
  },
  {
    corpus: "bavli",
    refs: [
      "Berakhot 2a:1",
      "Shabbat 2a:1",
      "Bava Kamma 2a:1",
      "Sanhedrin 2a:1",
      "Megillah 2a:1",
    ],
  },
  {
    corpus: "rashi",
    refs: [
      "Rashi on Genesis 1:1",
      "Rashi on Exodus 1:1",
      "Rashi on Deuteronomy 1:1",
      "Rashi on Psalms 1:1",
      "Rashi on Isaiah 1:1",
    ],
  },
  {
    corpus: "ramban",
    refs: [
      "Ramban on Genesis 1:1",
      "Ramban on Exodus 1:1",
      "Ramban on Leviticus 1:1",
      "Ramban on Numbers 1:1",
      "Ramban on Deuteronomy 1:1",
    ],
  },
  {
    corpus: "ibn_ezra",
    refs: [
      "Ibn Ezra on Genesis 1:1",
      "Ibn Ezra on Exodus 1:1",
      "Ibn Ezra on Psalms 1:1",
      "Ibn Ezra on Isaiah 1:1",
      "Ibn Ezra on Ecclesiastes 1:1",
    ],
  },
  {
    corpus: "midrash_rabbah",
    refs: [
      "Bereshit Rabbah 1:1",
      "Shemot Rabbah 1:1",
      "Vayikra Rabbah 1:1",
      "Bamidbar Rabbah 1:1",
      "Devarim Rabbah 1:1",
    ],
  },
  {
    corpus: "tanchuma",
    refs: [
      "Midrash Tanchuma, Bereshit 1",
      "Midrash Tanchuma, Shemot 1",
      "Midrash Tanchuma, Vayikra 1",
      "Midrash Tanchuma, Bamidbar 1",
      "Midrash Tanchuma, Devarim 1",
    ],
  },
  {
    corpus: "moreh",
    refs: [
      "Guide for the Perplexed, Part 1 1",
      "Guide for the Perplexed, Part 1 2",
      "Guide for the Perplexed, Part 2 1",
      "Guide for the Perplexed, Part 3 1",
      "Guide for the Perplexed, Prefatory Remarks 1",
    ],
  },
  {
    corpus: "mishneh_torah",
    refs: [
      "Mishneh Torah, Human Dispositions 1:1",
      "Mishneh Torah, Laws of Torah Study 1:1",
      "Mishneh Torah, Laws of Prayer and the Priestly Blessing 1:1",
      "Mishneh Torah, Laws of Shabbat 1:1",
      "Mishneh Torah, Laws of Marriage 1:1",
    ],
  },
  {
    corpus: "shulchan_arukh",
    refs: [
      "Shulchan Arukh, Orach Chayim 1:1",
      "Shulchan Arukh, Yoreh De'ah 1:1",
      "Shulchan Arukh, Even HaEzer 1:1",
      "Shulchan Arukh, Choshen Mishpat 1:1",
      "Shulchan Arukh, Orach Chayim 100:1",
    ],
  },
];

const FAILURE_THRESHOLD = 0.2;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const corpusFilterIdx = args.indexOf("--corpus");
  const corpusFilter = corpusFilterIdx >= 0 ? args[corpusFilterIdx + 1] : null;

  const probes = corpusFilter
    ? CORPUS_PROBES.filter(p => p.corpus === corpusFilter)
    : CORPUS_PROBES;

  if (!probes.length) {
    console.error(`Unknown corpus filter: ${corpusFilter}`);
    console.error(`Available: ${CORPUS_PROBES.map(p => p.corpus).join(", ")}`);
    process.exit(1);
  }

  console.log(`B0 — Ref format validation (${probes.length} corpus${probes.length === 1 ? "" : "es"})\n`);

  let anyFailed = false;

  for (const { corpus, refs } of probes) {
    console.log(`  [${corpus}]`);
    let passed = 0;
    let failed = 0;

    for (const ref of refs) {
      const result = await probeRef(ref);
      if (result.ok) {
        console.log(`    ✓  ${ref} → ${result.resolved}`);
        passed++;
      } else {
        console.log(`    ✗  ${ref} — ${result.error}`);
        failed++;
      }
      // Brief pause between API calls to avoid rate limiting
      await new Promise(r => setTimeout(r, 150));
    }

    const failRate = failed / refs.length;
    const status = failRate > FAILURE_THRESHOLD ? "FAIL" : "OK";
    console.log(`    → ${passed}/${refs.length} passed  [${status}]\n`);

    if (failRate > FAILURE_THRESHOLD) anyFailed = true;
  }

  if (anyFailed) {
    console.error("B0 FAILED: one or more corpora exceeded 20% failure threshold.");
    console.error("Fix the ref format for failing corpora before running B4.");
    process.exit(1);
  } else {
    console.log("B0 PASSED: all corpora within acceptable failure rate.");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
