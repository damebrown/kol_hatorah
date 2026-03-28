const DEFAULT_BASE = "https://www.sefaria.org";

export interface NameApiResult {
  ref?: string;
  url?: string;
  is_ref?: boolean;
  sections?: string[];
  sectionNames?: string[];
}

export interface TextsV3Meta {
  ref?: string;
  heRef?: string;
  primary_category?: string;
  categories?: string[];
  sectionNames?: string[];
  book?: string;
}

export interface SefariaLinkRow {
  ref?: string;
  sourceRef?: string;
  anchorRef?: string;
  type?: string;
  category?: string;
}

function dottedRef(ref: string): string {
  return ref.trim().replace(/\s+/g, ".");
}

function sefariaPageUrlFromNamePath(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path.replace(/^\//, "");
  return `${DEFAULT_BASE}/${p}`;
}

async function fetchJsonWithRetry(url: string, init: RequestInit, attempts = 3): Promise<unknown> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function fetchFirstAvailableSectionRef(work: string): Promise<string | null> {
  const url = `${DEFAULT_BASE}/api/texts/${encodeURIComponent(work)}?index_only=1`;
  const j = (await fetchJsonWithRetry(url, {})) as { firstAvailableSectionRef?: string; ref?: string };
  return j?.firstAvailableSectionRef ?? j?.ref ?? null;
}

export async function fetchWorkIndexSubset(work: string): Promise<{
  title?: string;
  heTitle?: string;
  categories?: string[];
  sectionNames?: string[];
  addressTypes?: string[];
  primaryCategory?: string;
} | null> {
  const url = `${DEFAULT_BASE}/api/v2/index/${encodeURIComponent(work)}`;
  try {
    const j = (await fetchJsonWithRetry(url, {})) as {
      title?: string;
      heTitle?: string;
      categories?: string[];
      schema?: { sectionNames?: string[]; addressTypes?: string[] };
    };
    if (!j?.title && !j?.categories) return null;
    const primaryCategory = Array.isArray(j.categories) && j.categories.length ? j.categories[0] : undefined;
    return {
      title: j.title,
      heTitle: j.heTitle,
      categories: j.categories,
      sectionNames: j.schema?.sectionNames,
      addressTypes: j.schema?.addressTypes,
      primaryCategory,
    };
  } catch {
    return null;
  }
}

export async function fetchNameForRef(ref: string): Promise<NameApiResult | null> {
  const url = `${DEFAULT_BASE}/api/name/${encodeURIComponent(ref)}`;
  try {
    return (await fetchJsonWithRetry(url, {})) as NameApiResult;
  } catch {
    return null;
  }
}

export async function fetchTextsV3ForRef(ref: string): Promise<TextsV3Meta | null> {
  const dotted = dottedRef(ref);
  const url = `${DEFAULT_BASE}/api/v3/texts/${encodeURIComponent(dotted)}`;
  try {
    return (await fetchJsonWithRetry(url, {})) as TextsV3Meta;
  } catch {
    return null;
  }
}

export async function fetchLinksForRef(ref: string): Promise<SefariaLinkRow[]> {
  const dotted = dottedRef(ref);
  const url = `${DEFAULT_BASE}/api/links/${encodeURIComponent(dotted)}`;
  try {
    const j = (await fetchJsonWithRetry(url, {})) as SefariaLinkRow[];
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

export function normalizedRefFromName(name: NameApiResult | null, fallback: string): string {
  if (name?.is_ref && name.ref) return name.ref;
  return fallback;
}

export function sefariaUrlFromName(name: NameApiResult | null, fallbackRef: string): string | undefined {
  if (name?.url) return sefariaPageUrlFromNamePath(name.url);
  return `${DEFAULT_BASE}/${dottedRef(fallbackRef)}`;
}

export function linkTargetsForSegment(segmentRef: string, links: SefariaLinkRow[]): Array<{
  target_ref: string;
  link_type: string;
  category: string | null;
  anchor_ref: string | null;
}> {
  const out: Array<{
    target_ref: string;
    link_type: string;
    category: string | null;
    anchor_ref: string | null;
  }> = [];
  for (const L of links) {
    const t = L.ref || L.sourceRef;
    if (!t || t === segmentRef) continue;
    out.push({
      target_ref: t,
      link_type: L.type || "unknown",
      category: L.category ?? null,
      anchor_ref: L.anchorRef ?? null,
    });
  }
  return out;
}
