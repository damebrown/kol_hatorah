import { createHash } from "crypto";

const SEFARIA_ORIGIN = "https://www.sefaria.org";

const TANAKH_BOOK_SUFFIX = "(Samuel|Kings|Chronicles)" as const;

/**
 * Aligns export-style refs with Sefaria's English titles: `1 Samuel 1:1` → `I Samuel 1:1`,
 * same for Kings and Chronicles (II for 2). Idempotent for `I` / `II` forms.
 */
export function normalizeTanakhRefForSefaria(ref: string): string {
  const t = ref.trim();
  const re = new RegExp(`^(1|2)\\s+${TANAKH_BOOK_SUFFIX}(\\s+[\\d:\\-\\s,]+)$`, "i");
  const m = t.match(re);
  if (!m) return t;
  const roman = m[1] === "1" ? "I" : "II";
  const bookLower = m[2].toLowerCase();
  const book = bookLower.charAt(0).toUpperCase() + bookLower.slice(1);
  return `${roman} ${book}${m[3]}`;
}

/** Strip zero-width / NBSP noise that breaks URL encoding or Sefaria matching. */
export function stripRefNoise(ref: string): string {
  return ref
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sefaria sometimes returns `error` as a string or object; treat any truthy error as failure. */
function hasSefariaApiError(o: Record<string, unknown>): boolean {
  const e = o.error;
  if (e == null || e === false) return false;
  if (typeof e === "string") return e.length > 0;
  return true;
}

/**
 * Ordered ref strings to try for `/api/texts/` (Mishnah titles vary in exports: `Berakhot 1:1` vs `Mishnah Berakhot 1:1`, Avot naming).
 */
export function sefariaTextsRefCandidates(row: { ref: string; work: string; type: string }): string[] {
  const ref = stripRefNoise(row.ref);
  const work = stripRefNoise(row.work);
  const out: string[] = [];
  const add = (s: string) => {
    const t = normalizeTanakhRefForSefaria(stripRefNoise(s));
    if (t && !out.includes(t)) out.push(t);
  };

  add(ref);

  if (/mishnah\s+pirkei\s+avot/i.test(ref)) {
    const tail = ref.replace(/^.*?mishnah\s+pirkei\s+avot\s*/i, "").trim();
    if (tail) {
      add(`Pirkei Avot ${tail}`);
      add(`Mishnah Avot ${tail}`);
      add(`Avot ${tail}`);
    }
  }

  if (row.type === "tanakh") {
    const splitBook = (book: "Kings" | "Samuel" | "Chronicles", refStr: string) => {
      const m = refStr.match(new RegExp(`^${book}\\s+([\\d:\\-\\s,]+)$`, "i"));
      if (!m) return;
      const tail = m[1].trim();
      add(`I ${book} ${tail}`);
      add(`II ${book} ${tail}`);
    };
    const noRoman = !/^(I|II|1|2)\s+/i.test(ref);
    if (noRoman) {
      splitBook("Kings", ref);
      splitBook("Samuel", ref);
      splitBook("Chronicles", ref);
    }
    const addrOnly = /^[\d\s:\-]+$/;
    if (addrOnly.test(ref) && work) {
      const w = work.replace(/\s+/g, " ").trim();
      if (/^kings$/i.test(w)) {
        add(`I Kings ${ref}`);
        add(`II Kings ${ref}`);
      }
      if (/^samuel$/i.test(w)) {
        add(`I Samuel ${ref}`);
        add(`II Samuel ${ref}`);
      }
      if (/^chronicles$/i.test(w)) {
        add(`I Chronicles ${ref}`);
        add(`II Chronicles ${ref}`);
      }
    }
  }

  if (row.type === "mishnah") {
    if (!/^mishnah\s+/i.test(ref)) {
      add(`Mishnah ${ref}`);
    } else {
      const tail = ref.replace(/^mishnah\s+/i, "").trim();
      if (tail) {
        add(tail);
        if (/mishnah\s+pirkei\s+avot/i.test(tail)) {
          const t2 = tail.replace(/^mishnah\s+pirkei\s+avot\s*/i, "").trim();
          if (t2) {
            add(`Pirkei Avot ${t2}`);
            add(`Mishnah Avot ${t2}`);
          }
        }
      }
    }

    const addrOnly = /^[\d\s:\-]+$/;
    if (addrOnly.test(ref) && work) {
      add(`${work} ${ref}`.trim());
      if (!/^mishnah\s+/i.test(work)) add(`Mishnah ${work} ${ref}`.trim());
    }

    if (/avot|pirkei/i.test(ref) || /avot|pirkei/i.test(work)) {
      add(ref.replace(/\bPirkei\s+Avot\b/gi, "Avot"));
      add(ref.replace(/\bMishnah\s+Avot\b/gi, "Pirkei Avot"));
      if (!/^mishnah\s+/i.test(ref)) add(`Mishnah ${ref.replace(/\bPirkei\s+Avot\b/gi, "Avot")}`);
    }
  }

  return out;
}

/** Legacy dotted path; breaks titles with a leading Roman numeral (e.g. "I Samuel" → I.Samuel). Prefer refToSefariaApiPath for APIs. */
export function refToSefariaDotted(ref: string): string {
  return ref.trim().replace(/\s+/g, ".").replace(/:/g, ".");
}

/**
 * Path segment for `/api/texts/` and `/api/links/`. Percent-encodes the human ref after
 * {@link normalizeTanakhRefForSefaria} — fixes dotted paths and digit-prefixed Samuel/Kings/Chronicles.
 */
export function refToSefariaApiPath(ref: string): string {
  return encodeURIComponent(normalizeTanakhRefForSefaria(ref));
}

/** Reader URL: `Book_With_Underscores.chapter.verse` (e.g. I_Samuel.13.8, Genesis.1.1). */
export function buildSefariaReaderUrl(ref: string): string {
  const t = normalizeTanakhRefForSefaria(ref.trim());
  const m = t.match(/^(.+?)\s+([\d:]+)$/);
  if (m) {
    const bookPath = m[1].replace(/\s+/g, "_");
    const addrPath = m[2].replace(/:/g, ".");
    return `${SEFARIA_ORIGIN}/${bookPath}.${addrPath}`;
  }
  return `${SEFARIA_ORIGIN}/${encodeURIComponent(t)}`;
}

export interface SefariaTextMeta {
  canonicalRef: string | null;
  sefariaNormalizedRef: string | null;
  heRef: string | null;
  sefariaUrl: string | null;
  primaryCategory: string | null;
  categories: string[];
  sectionNames: string[];
  daf: string | null;
  amud: string | null;
  segment: string | null;
}

export function extractTextMeta(json: unknown, fallbackRef: string): SefariaTextMeta | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  if (hasSefariaApiError(o)) return null;

  const canonicalRef = typeof o.ref === "string" ? o.ref : null;
  const heRef = typeof o.heRef === "string" ? o.heRef : null;
  const primaryCategory =
    typeof o.primary_category === "string"
      ? o.primary_category
      : typeof o.type === "string"
        ? o.type
        : null;
  const categories = Array.isArray(o.categories) ? o.categories.map((x) => String(x)) : [];
  const sectionNames = Array.isArray(o.sectionNames) ? o.sectionNames.map((x) => String(x)) : [];
  const daf =
    o.actualDaf != null && String(o.actualDaf).length
      ? String(o.actualDaf)
      : o.daf != null && String(o.daf).length
        ? String(o.daf)
        : null;
  const amud =
    o.actualAmud != null && String(o.actualAmud).length
      ? String(o.actualAmud)
      : o.amud != null && String(o.amud).length
        ? String(o.amud)
        : null;
  const segment = Array.isArray(o.sections) ? (o.sections as unknown[]).map((x) => String(x)).join(":") : null;

  const refForUrl = canonicalRef || fallbackRef;
  let sefariaUrl: string | null = null;
  try {
    sefariaUrl = buildSefariaReaderUrl(refForUrl);
  } catch {
    sefariaUrl = null;
  }

  return {
    canonicalRef,
    sefariaNormalizedRef: canonicalRef,
    heRef,
    sefariaUrl,
    primaryCategory,
    categories,
    sectionNames,
    daf,
    amud,
    segment,
  };
}

export interface NormalizedLink {
  toRef: string;
  category: string | null;
  linkType: string | null;
  anchorRef: string | null;
}

function pickLinkTarget(fromRef: string, link: Record<string, unknown>): string | null {
  const anchor = typeof link.anchorRef === "string" ? link.anchorRef : "";
  const sourceRef = typeof link.sourceRef === "string" ? link.sourceRef : "";
  const ref = typeof link.ref === "string" ? link.ref : "";
  const norm = (s: string) => s.trim().replace(/\s+/g, " ");
  const nf = norm(fromRef);
  if (anchor && norm(anchor) === nf) {
    if (sourceRef && norm(sourceRef) !== nf) return sourceRef;
    if (ref && norm(ref) !== nf) return ref;
    return sourceRef || ref || null;
  }
  if (ref && norm(ref) !== nf) return ref;
  if (sourceRef && norm(sourceRef) !== nf) return sourceRef;
  return ref || sourceRef || null;
}

export function normalizeLinksPayload(fromRef: string, json: unknown): NormalizedLink[] {
  if (!Array.isArray(json)) return [];
  const out: NormalizedLink[] = [];
  for (const item of json) {
    if (!item || typeof item !== "object") continue;
    const link = item as Record<string, unknown>;
    const toRef = pickLinkTarget(fromRef, link);
    if (!toRef) continue;
    const category = typeof link.category === "string" ? link.category : null;
    const linkType = typeof link.type === "string" ? link.type : null;
    const anchorRef = typeof link.anchorRef === "string" ? link.anchorRef : null;
    out.push({ toRef, category, linkType, anchorRef });
  }
  return out;
}

export function refLinkRowId(args: {
  segmentId: string;
  toRef: string;
  category: string;
  anchorRef: string;
  linkType: string;
}): string {
  const key = `${args.segmentId}|${args.toRef}|${args.category}|${args.anchorRef}|${args.linkType}`;
  return createHash("sha256").update(key).digest("hex").substring(0, 32);
}

async function fetchSefariaTextsMetaOnce(ref: string, signal?: AbortSignal): Promise<SefariaTextMeta | null> {
  try {
    const url = `${SEFARIA_ORIGIN}/api/texts/${refToSefariaApiPath(ref)}?commentary=0`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "KolHaTorah-enrichment/1.0",
      },
      signal,
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return extractTextMeta(json, ref);
  } catch {
    return null;
  }
}

export type EnrichmentSegmentRefContext = { ref: string; work: string; type: string };

/**
 * Fetches texts API metadata, trying Mishnah (and Avot) ref variants until one succeeds.
 * Returns the Sefaria ref string that worked so `/api/links/` can use the same shape.
 */
export async function fetchSefariaTextsMeta(
  row: EnrichmentSegmentRefContext,
  signal?: AbortSignal
): Promise<{ meta: SefariaTextMeta; refUsed: string } | null> {
  const candidates = sefariaTextsRefCandidates(row);
  for (const cand of candidates) {
    const meta = await fetchSefariaTextsMetaOnce(cand, signal);
    if (meta) return { meta, refUsed: cand };
  }
  return null;
}

export async function fetchSefariaLinks(ref: string, signal?: AbortSignal): Promise<NormalizedLink[]> {
  try {
    const url = `${SEFARIA_ORIGIN}/api/links/${refToSefariaApiPath(ref)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "KolHaTorah-enrichment/1.0",
      },
      signal,
    });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    return normalizeLinksPayload(ref, json);
  } catch {
    return [];
  }
}
