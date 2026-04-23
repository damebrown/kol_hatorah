/** Compact summary of one completed conversation turn, stored per thread. */
export interface TurnSummary {
  /** The raw query the user typed. */
  userQuery: string;
  /** The standalone query sent to the planner, when it differed from userQuery. */
  rewrittenQuery?: string;
  /** Classified intent of the turn (e.g. "EXACT_REF", "GENERAL_QA"). */
  intent: string;
  /** All resolved references produced by this turn, used as rewriter context. */
  lastRefs: { work: string; normalizedRef: string }[];
  /** First 120 chars of the rendered answer, for rewriter context. */
  answerSnippet: string;
  /** Set when the system returned a disambiguation question for this turn. */
  disambiguationPending?: {
    question: string;
    suggestions: string[];
    /** The standalone query that triggered disambiguation — replayed with the user's answer. */
    originalQuery: string;
  };
}

/** One in-session conversation thread. */
export interface Thread {
  id: string;
  /** Ordered list of turns, capped at CONVERSATION_MAX_TURNS (oldest dropped first). */
  turns: TurnSummary[];
  createdAt: number;
  lastAccessedAt: number;
}
