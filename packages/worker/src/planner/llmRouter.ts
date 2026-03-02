/**
 * LLM-based Intent Router for kol_hatorah planner.
 * Replaces brittle regex matching for phrasing variability.
 * LLM provides intent + slots only; execution stays in executePlan.
 * Zero hallucinations: never returns facts/citations from LLM.
 */
import { z } from "zod";
import { getConfig, OpenAIService } from "@kol-hatorah/core";
import { normalizeQueryForPlanning } from "./utils/normalizeQueryForPlanning";
import { planQuery } from "./planQuery";
import { parseRefFromQuery } from "./utils/parseRefFromQuery";
import { resolveScopeNode } from "./scope/resolver";
import { DEFAULT_LIMITS } from "../config/constants";
import {
  QueryIntent,
  QueryPlan,
  ScopeConstraint,
  ScopeNodeType,
  WorkRegistry,
} from "./types";

const CONFIDENCE_THRESHOLD = 0.75;

// ---------------------------------------------------------------------------
// LLM output schema (Zod)
// ---------------------------------------------------------------------------

const ScopeSlotSchema = z.object({
  rawCorpus: z.string().nullable(),
  rawSubcorpus: z.string().nullable(),
  rawWork: z.string().nullable(),
  chapter: z.number().nullable(),
  verse: z.number().nullable(),
});

const RefSlotSchema = z.object({
  raw: z.string(),
  work: z.string().nullable(),
  chapter: z.number().nullable(),
  verse: z.number().nullable(),
});

const LLMRouterOutputSchema = z
  .object({
    intent: z.enum([
      "EXACT_REF",
      "WORD_OCCURRENCES",
      "QUOTE_ENTITY",
      "FIND_REFERENCES",
      "GET_CHAPTER_TEXT",
      "CHAPTER_ABOUT",
      "GENERAL_QA",
    ]),
    confidence: z.number().min(0).max(1),
    term: z.string().nullable(),
    scope: ScopeSlotSchema.nullable(),
    ref: RefSlotSchema.nullable(),
    targetTypes: z.array(z.enum(["tanakh", "mishnah", "bavli"])).nullable(),
    needsDisambiguation: z.boolean(),
    disambiguationQuestion: z.string().nullable(),
    disambiguationSuggestions: z.array(z.string()).nullable(),
  })
  .refine(
    (data) => {
      if (data.needsDisambiguation) {
        return (
          data.disambiguationQuestion != null &&
          data.disambiguationQuestion.length > 0 &&
          data.disambiguationSuggestions != null &&
          data.disambiguationSuggestions.length > 0
        );
      }
      return true;
    },
    { message: "needsDisambiguation requires non-empty question and suggestions" }
  )
  .refine(
    (data) => {
      if (data.intent === "WORD_OCCURRENCES" || data.intent === "QUOTE_ENTITY") {
        return data.term != null && data.term.length > 0 && data.term.length <= 80;
      }
      return true;
    },
    { message: "WORD_OCCURRENCES/QUOTE_ENTITY require non-empty term <= 80 chars" }
  )
  .refine(
    (data) => {
      if (data.intent === "GET_CHAPTER_TEXT") {
        return (
          data.scope != null &&
          data.scope.rawWork != null &&
          data.scope.rawWork.length > 0 &&
          data.scope.chapter != null
        );
      }
      return true;
    },
    { message: "GET_CHAPTER_TEXT requires scope.rawWork and scope.chapter" }
  )
  .refine(
    (data) => {
      if (data.intent === "EXACT_REF") {
        return data.ref != null && data.ref.raw.length > 0;
      }
      return true;
    },
    { message: "EXACT_REF requires ref.raw" }
  );

type LLMRouterOutput = z.infer<typeof LLMRouterOutputSchema>;

// ---------------------------------------------------------------------------
// LLM call (env-gated)
// ---------------------------------------------------------------------------

function isLLMRouterEnabled(): boolean {
  return process.env.KOL_HATORAH_ENABLE_LLM_ROUTER === "1";
}

function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

export type CallLLMOptions = {
  /** Override for testing - inject mock */
  callLLM?: (prompt: string) => Promise<string>;
};

async function callLLMInternal(prompt: string): Promise<string> {
  const config = getConfig();
  const service = new OpenAIService(
    config.openai.apiKey,
    config.openai.embeddingModel,
    config.openai.chatModel
  );
  const result = await service.getResponse({
    model: config.openai.chatModel,
    instructions: ROUTER_SYSTEM_PROMPT,
    input: prompt,
    temperature: 0,
    max_tokens: 300,
  });
  return result.text;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const ROUTER_SYSTEM_PROMPT = `You are an intent classifier for a Hebrew Jewish texts search system. Classify the user query into ONE intent and extract slots. Return JSON only, no prose, no markdown.

Intents:
- EXACT_REF: User wants a specific verse/reference (e.g. "בראשית א:א", "משנה ג בפרק ב במסכת סוטה")
- WORD_OCCURRENCES: User asks where a word/phrase appears (e.g. "איפה מופיעה המילה X", "היכן הביטוי Y")
- QUOTE_ENTITY: User asks which mishnayot mention an entity (e.g. "באילו משניות מופיע רבי עקיבא", "משניות שמזכירות X")
- FIND_REFERENCES: User asks which verses are quoted/cited in a tractate (e.g. "אילו פסוקים מצוטטים במסכת סוטה")
- GET_CHAPTER_TEXT: User wants full text of a chapter (e.g. "תן לי את פרק ז במשנה במסכת סוטה")
- CHAPTER_ABOUT: User asks what a chapter is about (e.g. "על מה מדבר פרק ג בברכות")
- GENERAL_QA: General question, no specific retrieval (e.g. "מה ההבדל בין משנה לגמרא")

Rules:
- Use raw spans from the query. Never invent work names.
- If unsure, set confidence < 0.75 or needsDisambiguation=true.
- For scope: rawCorpus (משנה/תנ"ך/בבלי), rawSubcorpus (נביאים/כתובים/תורה), rawWork (סוטה/ישעיה).
- Return valid JSON only.`;

const FEW_SHOT_EXAMPLES = `
Examples (query -> JSON):

1. "איפה בנביאים מופיעה המילה אור"
{"intent":"WORD_OCCURRENCES","confidence":0.95,"term":"אור","scope":{"rawCorpus":null,"rawSubcorpus":"נביאים","rawWork":null,"chapter":null,"verse":null},"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

2. "באילו משניות במסכת סוטה מופיע רבי עקיבא"
{"intent":"QUOTE_ENTITY","confidence":0.95,"term":"רבי עקיבא","scope":{"rawCorpus":"משנה","rawSubcorpus":null,"rawWork":"סוטה","chapter":null,"verse":null},"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

3. "תן לי את פרק ז במשנה במסכת סוטה"
{"intent":"GET_CHAPTER_TEXT","confidence":0.95,"term":null,"scope":{"rawCorpus":"משנה","rawSubcorpus":null,"rawWork":"סוטה","chapter":7,"verse":null},"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

4. "אילו פסוקים מצוטטים במסכת סוטה במשנה"
{"intent":"FIND_REFERENCES","confidence":0.9,"term":null,"scope":{"rawCorpus":"משנה","rawSubcorpus":null,"rawWork":"סוטה","chapter":null,"verse":null},"ref":null,"targetTypes":["tanakh"],"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

5. "בראשית א:א"
{"intent":"EXACT_REF","confidence":0.98,"term":null,"scope":null,"ref":{"raw":"בראשית א:א","work":null,"chapter":1,"verse":1},"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

6. "מה ההבדל בין משנה לגמרא"
{"intent":"GENERAL_QA","confidence":0.9,"term":null,"scope":null,"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

7. "על מה מדבר פרק 3 בברכות"
{"intent":"CHAPTER_ABOUT","confidence":0.95,"term":null,"scope":{"rawCorpus":null,"rawSubcorpus":null,"rawWork":"ברכות","chapter":3,"verse":null},"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}

8. "משניות שמזכירות רבי מאיר"
{"intent":"QUOTE_ENTITY","confidence":0.9,"term":"רבי מאיר","scope":{"rawCorpus":"משנה","rawSubcorpus":null,"rawWork":null,"chapter":null,"verse":null},"ref":null,"targetTypes":null,"needsDisambiguation":false,"disambiguationQuestion":null,"disambiguationSuggestions":null}
`;

// ---------------------------------------------------------------------------
// Convert LLM output to QueryPlan
// ---------------------------------------------------------------------------

function resolveScopeFromSlots(
  slots: LLMRouterOutput["scope"],
  reg: WorkRegistry
): ScopeConstraint {
  const scope: ScopeConstraint = {};
  if (!slots) return scope;

  // Prefer rawWork for tractate/book
  if (slots.rawWork?.trim()) {
    const res = resolveScopeNode(slots.rawWork.trim(), reg);
    if (res.workName) scope.work = res.workName;
    if (res.node) scope.node = res.node;
  }

  // rawCorpus (משנה, תנ"ך, בבלי)
  if (slots.rawCorpus?.trim()) {
    const raw = slots.rawCorpus.trim().replace(/^ב/, "");
    if (raw === "משנה") scope.node = { type: ScopeNodeType.CORPUS, name: "mishnah" };
    else if (raw === "תנ\"ך" || raw === "תנך") scope.node = { type: ScopeNodeType.CORPUS, name: "tanakh" };
    else if (raw === "בבלי") scope.node = { type: ScopeNodeType.CORPUS, name: "bavli" };
    else {
      const res = resolveScopeNode(slots.rawCorpus.trim(), reg);
      if (res.node?.type === ScopeNodeType.CORPUS) scope.node = res.node;
      if (res.workName && !scope.work) scope.work = res.workName;
    }
  }

  // rawSubcorpus (נביאים, כתובים, תורה)
  if (slots.rawSubcorpus?.trim() && !scope.node) {
    const res = resolveScopeNode(slots.rawSubcorpus.trim(), reg);
    if (res.node?.type === ScopeNodeType.SUBCORPUS) scope.node = res.node;
  }

  if (slots.chapter != null) scope.chapter = slots.chapter;

  return scope;
}

function getStrategy(intent: string): "SQL_ONLY" | "VECTOR_ONLY" | "HYBRID_SQL_THEN_LLM" {
  if (intent === "CHAPTER_ABOUT") return "HYBRID_SQL_THEN_LLM";
  if (intent === "GENERAL_QA") return "VECTOR_ONLY";
  return "SQL_ONLY";
}

function getLimits(intent: string): { maxResults: number; maxSegmentsForSynthesis: number } {
  switch (intent) {
    case "EXACT_REF":
    case "GET_CHAPTER_TEXT":
      return { maxResults: DEFAULT_LIMITS.EXACT_REF_MAX_RESULTS, maxSegmentsForSynthesis: DEFAULT_LIMITS.EXACT_REF_MAX_SEGMENTS };
    case "WORD_OCCURRENCES":
      return { maxResults: DEFAULT_LIMITS.WORD_OCCURRENCES_MAX_RESULTS, maxSegmentsForSynthesis: 0 };
    case "QUOTE_ENTITY":
      return { maxResults: DEFAULT_LIMITS.QUOTE_ENTITY_MAX_RESULTS, maxSegmentsForSynthesis: 0 };
    case "CHAPTER_ABOUT":
      return { maxResults: DEFAULT_LIMITS.CHAPTER_ABOUT_MAX_RESULTS, maxSegmentsForSynthesis: DEFAULT_LIMITS.CHAPTER_ABOUT_MAX_SEGMENTS };
    case "GENERAL_QA":
      return { maxResults: DEFAULT_LIMITS.GENERAL_QA_TOP_K, maxSegmentsForSynthesis: 0 };
    default:
      return { maxResults: 50, maxSegmentsForSynthesis: 0 };
  }
}

function llmOutputToQueryPlan(
  out: LLMRouterOutput,
  normalized: string,
  reg: WorkRegistry,
  rawJson: string
): QueryPlan {
  const intentStr = out.intent;
  const strategy = getStrategy(intentStr);
  const limits = getLimits(intentStr);

  // Map GET_CHAPTER_TEXT to EXACT_REF (chapter-only) for execution
  const effectiveIntent =
    intentStr === "GET_CHAPTER_TEXT" ? QueryIntent.EXACT_REF : (QueryIntent[intentStr as keyof typeof QueryIntent] ?? QueryIntent.GENERAL_QA);

  const scope = resolveScopeFromSlots(out.scope, reg);

  // Disambiguation
  const disambiguation =
    out.needsDisambiguation && out.disambiguationQuestion && out.disambiguationSuggestions?.length
      ? {
          required: true as const,
          reason: out.disambiguationQuestion,
          suggestions: out.disambiguationSuggestions,
        }
      : undefined;

  // Ref for EXACT_REF / GET_CHAPTER_TEXT
  let ref: QueryPlan["ref"];
  if (effectiveIntent === QueryIntent.EXACT_REF && (out.ref || (intentStr === "GET_CHAPTER_TEXT" && out.scope))) {
    const work = out.ref?.work ?? (out.scope?.rawWork ? resolveScopeNode(out.scope.rawWork.trim(), reg).workName : undefined) ?? scope.work;
    const ch = out.ref?.chapter ?? out.scope?.chapter ?? null;
    const vs = out.ref?.verse ?? out.scope?.verse ?? 0;
    const raw = out.ref?.raw ?? `${out.scope?.rawWork ?? ""} פרק ${ch}`;
    const normalizedRef = work && ch != null ? (vs ? `${work} ${ch}:${vs}` : `${work} ${ch}:`) : raw;
    ref = {
      raw,
      normalizedRef,
      work: work ?? undefined,
      chapter: ch ?? undefined,
      verse: vs ?? undefined,
    };
  } else if (out.ref && intentStr === "EXACT_REF") {
    const parsed = parseRefFromQuery(out.ref.raw, reg);
    if (parsed) {
      ref = {
        raw: `${parsed.rawWork} ${parsed.chapter}:${parsed.verse}`,
        normalizedRef: parsed.normalizedRef,
        work: parsed.work,
        chapter: parsed.chapter,
        verse: parsed.verse,
      };
    } else {
      const work = out.ref.work ?? scope.work;
      const ch = out.ref.chapter ?? null;
      const vs = out.ref.verse ?? null;
      ref = {
        raw: out.ref.raw,
        normalizedRef: work && ch != null && vs != null ? `${work} ${ch}:${vs}` : out.ref.raw,
        work: work ?? undefined,
        chapter: ch ?? undefined,
        verse: vs ?? undefined,
      };
    }
  }

  return {
    intent: effectiveIntent,
    scope: intentStr === "GET_CHAPTER_TEXT" ? { ...scope, chapter: out.scope?.chapter ?? undefined } : scope,
    ref,
    term: out.term ?? undefined,
    targetTypes: out.targetTypes ?? undefined,
    strategy,
    limits,
    disambiguation,
    debug: {
      matchedRule: "LLM_ROUTER",
      notes: [rawJson],
    },
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function planQueryWithLLMRouter(
  queryRaw: string,
  registry: WorkRegistry,
  opts?: { enableLLM?: boolean } & CallLLMOptions
): Promise<QueryPlan> {
  const normalized = normalizeQueryForPlanning(queryRaw);
  const hasMock = opts?.callLLM != null;
  const useLLM =
    opts?.enableLLM !== false &&
    (hasMock || (isLLMRouterEnabled() && hasOpenAIKey()));

  if (!useLLM) {
    return planQuery(normalized, registry);
  }

  const callLLM = opts?.callLLM ?? callLLMInternal;

  try {
    const prompt = `Query: ${normalized}\n\nReturn JSON only:${FEW_SHOT_EXAMPLES}\n\nJSON:`;
    const rawResponse = await callLLM(prompt);

    // Strip markdown code blocks if present
    let jsonStr = rawResponse.trim();
    const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    const parsed = JSON.parse(jsonStr) as unknown;
    const result = LLMRouterOutputSchema.safeParse(parsed);

    if (!result.success) {
      return planQuery(normalized, registry);
    }

    const out = result.data;
    if (out.confidence < CONFIDENCE_THRESHOLD) {
      return planQuery(normalized, registry);
    }

    return llmOutputToQueryPlan(out, normalized, registry, jsonStr);
  } catch {
    return planQuery(normalized, registry);
  }
}
