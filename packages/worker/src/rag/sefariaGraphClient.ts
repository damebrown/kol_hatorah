import { refToSefariaApiPath } from "../enrich/sefariaClient";
import type { SefariaLinkRow } from "../ingest/bavli/sefariaApi";

const SEFARIA_ORIGIN = "https://www.sefaria.org";
const DEFAULT_TIMEOUT_MS = 12_000;

export interface SefariaGraphLogger {
  warn: (obj: Record<string, unknown>, msg?: string) => void;
}

export interface RefTopicLinkRow {
  topic?: string;
  linkType?: string;
  anchorRef?: string;
}

function apiPathForRef(ref: string): string {
  return refToSefariaApiPath(ref.trim());
}

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

/**
 * Thin HTTP client for graph Stage A: /api/links and /api/ref-topic-links only.
 * In-memory cache; failures are swallowed after warn — callers fall back to plain retrieval.
 */
export class SefariaGraphClient {
  private readonly cacheLinks = new Map<string, SefariaLinkRow[]>();
  private readonly cacheTopics = new Map<string, RefTopicLinkRow[]>();
  private readonly cacheResolvedRef = new Map<string, string | null>();
  private readonly timeoutMs: number;

  constructor(
    private readonly logger: SefariaGraphLogger,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ) {
    this.timeoutMs = timeoutMs;
  }

  private async fetchWithTimeout(url: string): Promise<unknown> {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), this.timeoutMs);
    try {
      return await fetchJson(url, ac.signal);
    } finally {
      clearTimeout(t);
    }
  }

  private nameCandidates(displayRef: string): string[] {
    const base = displayRef.trim();
    const out = new Set<string>([base]);
    // Sefaria title parser commonly expects a comma in "X on Torah, Numbers 15:1".
    out.add(base.replace(/\bon Torah\s+([A-Za-z])/i, "on Torah, $1"));
    // Some extracted refs carry zero section indexes; probe and fallback to 1-based.
    out.add(base.replace(/:0(\b)/g, ":1"));
    out.add(base.replace(/\s0:/g, " 1:"));
    out.add(base.replace(/\bon Torah,\s+([A-Za-z]+)\s+(\d+):0(\b)/i, "on Torah, $1 $2:1$3"));
    return [...out].filter((x) => x.length > 0);
  }

  private async resolveCanonicalRef(displayRef: string): Promise<string | null> {
    const key = displayRef.trim();
    if (this.cacheResolvedRef.has(key)) return this.cacheResolvedRef.get(key)!;

    const candidates = this.nameCandidates(key);
    for (const cand of candidates) {
      const url = `${SEFARIA_ORIGIN}/api/name/${encodeURIComponent(cand)}`;
      try {
        const json = (await this.fetchWithTimeout(url)) as { is_ref?: boolean; ref?: string; error?: string };
        if (json?.is_ref && typeof json.ref === "string" && json.ref.trim().length > 0) {
          const canon = json.ref.trim();
          this.cacheResolvedRef.set(key, canon);
          return canon;
        }
      } catch {
        // Try the next candidate; caller remains best-effort.
      }
    }
    this.cacheResolvedRef.set(key, null);
    return null;
  }

  async getLinksForRef(displayRef: string): Promise<SefariaLinkRow[]> {
    const resolvedRef = await this.resolveCanonicalRef(displayRef);
    if (!resolvedRef) return [];
    const apiPath = apiPathForRef(resolvedRef);
    const key = `links:${apiPath}`;
    const hit = this.cacheLinks.get(key);
    if (hit) return hit;

    const url = `${SEFARIA_ORIGIN}/api/links/${apiPath}`;
    try {
      const json = await this.fetchWithTimeout(url);
      if (json && typeof json === "object" && "error" in json) {
        this.logger.warn({ url, kind: "links", error: (json as { error?: string }).error }, "Sefaria links error");
        this.cacheLinks.set(key, []);
        return [];
      }
      if (!Array.isArray(json)) {
        this.logger.warn({ url, kind: "links", shape: typeof json }, "Sefaria links: unexpected JSON shape");
        this.cacheLinks.set(key, []);
        return [];
      }
      const rows = json as SefariaLinkRow[];
      this.cacheLinks.set(key, rows);
      return rows;
    } catch (e) {
      this.logger.warn(
        { url, err: e instanceof Error ? e.message : String(e), kind: "links" },
        "Sefaria links request failed; continuing without graph links"
      );
      this.cacheLinks.set(key, []);
      return [];
    }
  }

  /**
   * ref-topic-links requires interface_lang=english|hebrew or the server returns an error payload.
   */
  async getRefTopicLinksForRef(displayRef: string): Promise<RefTopicLinkRow[]> {
    const resolvedRef = await this.resolveCanonicalRef(displayRef);
    if (!resolvedRef) return [];
    const apiPath = apiPathForRef(resolvedRef);
    const key = `topics:${apiPath}`;
    const hit = this.cacheTopics.get(key);
    if (hit) return hit;

    const url = `${SEFARIA_ORIGIN}/api/ref-topic-links/${apiPath}?interface_lang=english`;
    try {
      const json = await this.fetchWithTimeout(url);
      if (json && typeof json === "object" && "error" in json) {
        this.logger.warn({ url, error: (json as { error?: string }).error, kind: "ref-topic-links" }, "Sefaria ref-topic-links error");
        this.cacheTopics.set(key, []);
        return [];
      }
      if (!Array.isArray(json)) {
        this.logger.warn({ url, kind: "ref-topic-links", shape: typeof json }, "Sefaria ref-topic-links: unexpected JSON shape");
        this.cacheTopics.set(key, []);
        return [];
      }
      const rows = json as RefTopicLinkRow[];
      this.cacheTopics.set(key, rows);
      return rows;
    } catch (e) {
      this.logger.warn(
        { url, err: e instanceof Error ? e.message : String(e), kind: "ref-topic-links" },
        "Sefaria ref-topic-links request failed; continuing without topic signals"
      );
      this.cacheTopics.set(key, []);
      return [];
    }
  }

  // Stage B: add related / topics-graph (or other) calls here with the same cache + timeout pattern.
}
