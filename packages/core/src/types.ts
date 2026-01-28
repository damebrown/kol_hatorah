import { z } from "zod";

export type TextType = "tanakh" | "mishnah" | "bavli";

export interface Chunk extends Record<string, unknown> {
  id: string;
  text: string;
  source: string;
  type: TextType;
  work: string;
  ref: string;
  normalizedRef: string;
  lang: "he";
  section?: string;
  segment?: string;
  versionTitle?: string;
  license?: string;
  attribution?: string;
  url?: string;
  createdAt: string;
}

export const ChunkZod = z.object({
  id: z.string(),
  text: z.string(),
  source: z.string(),
  type: z.union([z.literal("tanakh"), z.literal("mishnah"), z.literal("bavli")]),
  work: z.string(),
  ref: z.string(),
  normalizedRef: z.string(),
  lang: z.literal("he"),
  section: z.string().optional(),
  segment: z.string().optional(),
  versionTitle: z.string().optional(),
  license: z.string().optional(),
  attribution: z.string().optional(),
  url: z.string().url().optional(),
  createdAt: z.string().datetime(),
});
