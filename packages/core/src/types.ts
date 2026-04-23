import { z } from "zod";

export type TextType =
  | "tanakh"
  | "mishnah"
  | "bavli"
  | "tanakh_commentary"
  | "midrash"
  | "philosophy"
  | "halacha"
  | "liturgy";

export interface Chunk extends Record<string, unknown> {
  id: string;
  text: string;
  source: string;
  type: TextType;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: "he" | "en";
  section?: string;
  segment?: string;
  versionTitle?: string;
  license?: string;
  attribution?: string;
  url?: string;
  createdAt: string;
  /** Sefaria reader URL for this ref (metadata enrichment). */
  sefariaUrl?: string;
  heRef?: string;
  primaryCategory?: string;
  categories?: string[];
  sectionNames?: string[];
  daf?: string;
  amud?: string;
  hasLinks?: boolean;
  linksCount?: number;
  /** Canonical ref string returned by Sefaria (stored without replacing `ref` / IDs). */
  sefariaCanonicalRef?: string;
  sefariaNormalizedRef?: string;
  /** Parenthetical scripture refs extracted from the text (e.g. ["בראשית א", "שמות כ:ב"]). */
  quotedRefs?: string[];
  /** Nikkud-stripped text used for embedding. Transient — not stored in Qdrant payload. */
  textEmbed?: string;
}

export const ChunkZod = z.object({
  id: z.string(),
  text: z.string(),
  source: z.string(),
  type: z.union([
    z.literal("tanakh"),
    z.literal("mishnah"),
    z.literal("bavli"),
    z.literal("tanakh_commentary"),
    z.literal("midrash"),
    z.literal("philosophy"),
    z.literal("halacha"),
    z.literal("liturgy"),
  ]),
  work: z.string(),
  ref: z.string(),
  normalizedRef: z.string(),
  lang: z.union([z.literal("he"), z.literal("en")]),
  section: z.string().optional(),
  segment: z.string().optional(),
  versionTitle: z.string().optional(),
  license: z.string().optional(),
  attribution: z.string().optional(),
  url: z.string().url().optional(),
  createdAt: z.string().datetime(),
  sefariaUrl: z.string().optional(),
  heRef: z.string().optional(),
  primaryCategory: z.string().optional(),
  categories: z.array(z.string()).optional(),
  sectionNames: z.array(z.string()).optional(),
  daf: z.string().optional(),
  amud: z.string().optional(),
  hasLinks: z.boolean().optional(),
  linksCount: z.number().optional(),
  sefariaCanonicalRef: z.string().optional(),
  sefariaNormalizedRef: z.string().optional(),
  quotedRefs: z.array(z.string()).optional(),
});
