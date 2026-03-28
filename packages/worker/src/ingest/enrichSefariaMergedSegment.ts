import { createHash } from "crypto";
import { Chunk, createChunkId, type Logger, type TextType } from "@kol-hatorah/core";
import type { RefLinkRow, SegmentEnrichmentUpdate } from "../storage/sqlite/types";
import {
  fetchLinksForRef,
  fetchNameForRef,
  fetchTextsV3ForRef,
  linkTargetsForSegment,
  normalizedRefFromName,
  sefariaUrlFromName,
} from "./bavli/sefariaApi";

export function refLinkRowIdStable(segmentId: string, toRef: string, linkType: string): string {
  return createHash("sha256").update(`${segmentId}|${toRef}|${linkType}`).digest("hex").slice(0, 32);
}

export interface RefPartsForEnrichment {
  daf: string | null;
  amud: string | null;
  enrichSegment: string | null;
}

/**
 * Shared enrichment path for local merged.json segments: name API → v3 texts meta → links API.
 * Matches Bavli ingestion behavior; API failures log warnings and yield partial metadata.
 */
export async function enrichSefariaMergedSegment(args: {
  work: string;
  exportRef: string;
  text: string;
  segmentType: TextType;
  versionTitle: string | undefined;
  license: string | undefined;
  attribution: string | undefined;
  /** Stored on ref_links.source_work (defaults to `work`) */
  sourceWorkForLinks?: string;
  resolveRefParts?: (canonicalRef: string) => RefPartsForEnrichment | null;
  logger: Logger;
}): Promise<{
  chunk: Chunk;
  enrichment: { update: SegmentEnrichmentUpdate; links: RefLinkRow[] };
}> {
  const {
    work,
    exportRef,
    text,
    segmentType,
    versionTitle,
    license,
    attribution,
    sourceWorkForLinks,
    resolveRefParts,
    logger,
  } = args;
  const createdAt = new Date().toISOString();
  const linkSourceWork = sourceWorkForLinks ?? work;

  let nameData = null as Awaited<ReturnType<typeof fetchNameForRef>>;
  try {
    nameData = await fetchNameForRef(exportRef);
  } catch (e) {
    logger.warn({ work, exportRef, err: String(e) }, "Sefaria name API failed; using export-derived ref");
  }

  const canonicalRef = normalizedRefFromName(nameData, exportRef);
  if (nameData?.ref && nameData.ref !== exportRef) {
    logger.warn(
      { work, exportRef, canonicalRef: nameData.ref },
      "Adjusted segment ref from export index using Sefaria name API",
    );
  }

  let v3 = null as Awaited<ReturnType<typeof fetchTextsV3ForRef>>;
  try {
    v3 = await fetchTextsV3ForRef(canonicalRef);
  } catch (e) {
    logger.warn({ work, ref: canonicalRef, err: String(e) }, "Sefaria v3 texts API failed; continuing with partial enrichment");
  }

  let links: Awaited<ReturnType<typeof fetchLinksForRef>> = [];
  try {
    links = await fetchLinksForRef(canonicalRef);
  } catch (e) {
    logger.warn({ work, ref: canonicalRef, err: String(e) }, "Sefaria links API failed; storing segment without links");
  }

  const url = sefariaUrlFromName(nameData, canonicalRef);
  const id = createChunkId({
    type: segmentType,
    work,
    normalizedRef: canonicalRef,
    ref: canonicalRef,
    lang: "he",
    versionTitle: versionTitle ?? "",
    source: "sefaria-merged",
  });

  const resolved = resolveRefParts?.(canonicalRef) ?? null;
  let enrichSegment = resolved?.enrichSegment ?? null;
  if (enrichSegment == null && nameData?.sections?.length) {
    enrichSegment = nameData.sections.map(String).join(":");
  }

  const heRef = v3?.heRef ?? null;
  const primaryCategory = v3?.primary_category ?? null;
  const categoriesJson = v3?.categories?.length ? JSON.stringify(v3.categories) : null;
  const sectionNamesJson = v3?.sectionNames?.length ? JSON.stringify(v3.sectionNames) : null;

  const chunk: Chunk = {
    id,
    text,
    source: "sefaria-merged",
    type: segmentType,
    work,
    ref: canonicalRef,
    normalizedRef: canonicalRef,
    lang: "he",
    createdAt,
    versionTitle,
    license,
    attribution,
    url,
    sefariaUrl: url,
    sefariaCanonicalRef: canonicalRef,
    sefariaNormalizedRef: canonicalRef,
    primaryCategory: primaryCategory ?? undefined,
    heRef: heRef ?? undefined,
    categories: v3?.categories,
    sectionNames: v3?.sectionNames,
    daf: resolved?.daf ?? undefined,
    amud: resolved?.amud ?? undefined,
    segment: enrichSegment ?? undefined,
    hasLinks: links.length > 0,
    linksCount: links.length,
  };

  const linkRows: RefLinkRow[] = linkTargetsForSegment(canonicalRef, links).map((t) => ({
    id: refLinkRowIdStable(id, t.target_ref, t.link_type),
    segment_id: id,
    from_ref: canonicalRef,
    to_ref: t.target_ref,
    category: t.category,
    link_type: t.link_type,
    anchor_ref: t.anchor_ref,
    source_work: linkSourceWork,
  }));

  const update: SegmentEnrichmentUpdate = {
    id,
    enrichedAt: createdAt,
    sefariaCanonicalRef: canonicalRef,
    sefariaNormalizedRef: canonicalRef,
    heRef,
    sefariaUrl: url ?? null,
    primaryCategory,
    categoriesJson,
    sectionNamesJson,
    daf: resolved?.daf ?? null,
    amud: resolved?.amud ?? null,
    enrichSegment,
    hasLinks: links.length > 0 ? 1 : 0,
    linksCount: links.length,
  };

  return { chunk, enrichment: { update, links: linkRows } };
}
