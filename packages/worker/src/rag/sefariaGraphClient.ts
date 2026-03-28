import { refToSefariaDotted } from "../enrich/sefariaClient";
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

function dottedForApi(ref: string): string {
  return refToSefariaDotted(ref.trim());
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
  private readonly timeoutMs: number;

  constructor(
    private readonly logger: SefariaGraphLogger,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ) {
    this.timeoutMs = timeoutMs;
  }

  async getLinksForRef(displayRef: string): Promise<SefariaLinkRow[]> {
    const dotted = dottedForApi(displayRef);
    const key = `links:${dotted}`;
    const hit = this.cacheLinks.get(key);
    if (hit) return hit;

    const url = `${SEFARIA_ORIGIN}/api/links/${encodeURIComponent(dotted)}`;
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), this.timeoutMs);
      let json: unknown;
      try {
        json = await fetchJson(url, ac.signal);
      } finally {
        clearTimeout(t);
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
    const dotted = dottedForApi(displayRef);
    const key = `topics:${dotted}`;
    const hit = this.cacheTopics.get(key);
    if (hit) return hit;

    const url = `${SEFARIA_ORIGIN}/api/ref-topic-links/${encodeURIComponent(dotted)}?interface_lang=english`;
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), this.timeoutMs);
      let json: unknown;
      try {
        json = await fetchJson(url, ac.signal);
      } finally {
        clearTimeout(t);
      }
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
