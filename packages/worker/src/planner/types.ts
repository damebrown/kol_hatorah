export enum QueryIntent {
  EXACT_REF = "EXACT_REF",
  WORD_OCCURRENCES = "WORD_OCCURRENCES",
  CHAPTER_ABOUT = "CHAPTER_ABOUT",
  QUOTE_ENTITY = "QUOTE_ENTITY",
  LIST_WORKS_MENTIONING_ENTITY = "LIST_WORKS_MENTIONING_ENTITY",
  GENERAL_QA = "GENERAL_QA",
}

export enum ScopeNodeType {
  CORPUS = "CORPUS",
  SUBCORPUS = "SUBCORPUS",
  WORK = "WORK",
}

export interface ScopeNode {
  type: ScopeNodeType;
  name: string;
}

export interface ScopeConstraint {
  node?: ScopeNode;
  work?: string;
  chapter?: number;
}

export interface QueryPlan {
  intent: QueryIntent;
  scope: ScopeConstraint;
  ref?: { raw: string; normalizedRef: string; work?: string; chapter?: number; verse?: number };
  term?: string;
  strategy: "SQL_ONLY" | "VECTOR_ONLY" | "HYBRID_SQL_THEN_LLM";
  limits: { maxResults: number; maxSegmentsForSynthesis: number };
  disambiguation?:
    | {
        required: true;
        reason: string;
        suggestions: string[];
      }
    | {
        required: false;
      };
  aggregateWorks?: boolean;
  debug: { matchedRule: string; notes?: string[] };
}

export type PlanResult =
  | { kind: "DISAMBIGUATION_REQUIRED"; message: string; suggestions: string[]; debug?: any }
  | { kind: "REFUSAL"; message: string; debug?: any }
  | {
      kind: "OK";
      answer: string;
      rows?: { ref: string; text: string }[];
      citations?: string[];
      formattedCitations?: string;
      works?: { work: string; count?: number }[];
      plan: QueryPlan;
    };

export type WorkRegistry = Map<string, Set<string>>; // type -> works
