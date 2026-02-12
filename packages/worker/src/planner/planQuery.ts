import { DEFAULT_LIMITS } from "../config/constants";
import { MESSAGES } from "../config/messages";
import { QueryIntent, ScopeConstraint, QueryPlan, ScopeNodeType, WorkRegistry } from "./types";
import { ensureRegistry } from "./scope/registry";
import { resolveScopeNode } from "./scope/resolver";

const chapterRegex = /פרק\s+(\d+)/;

function hebrewPreferredNote(q: string): string | undefined {
  const hasLatin = /[A-Za-z]/.test(q);
  const hasHebrew = /[א-ת]/.test(q);
  if (hasLatin && !hasHebrew) {
    return MESSAGES.HEBREW_ONLY;
  }
  if (hasLatin && hasHebrew) {
    return MESSAGES.HEBREW_PREFERRED_NOTE;
  }
  return undefined;
}

export async function planQuery(query: string, registryOverride?: WorkRegistry): Promise<QueryPlan> {
  const reg = registryOverride || (await ensureRegistry());
  const normalized = query.trim();
  const notes: string[] = [];
  const note = hebrewPreferredNote(normalized);
  if (note) notes.push(note);

  // EXACT REF
  const exactMatch = normalized.match(/([^\s]+)\s+(\d+):(\d+)/);
  if (exactMatch) {
    const workRaw = exactMatch[1];
    const chapter = parseInt(exactMatch[2], 10);
    const verse = parseInt(exactMatch[3], 10);
    const resolved = resolveScopeNode(workRaw, reg);
    const work = resolved.workName || workRaw;
    const plan: QueryPlan = {
      intent: QueryIntent.EXACT_REF,
      scope: { work },
      ref: work ? { raw: `${workRaw} ${chapter}:${verse}`, normalizedRef: `${work} ${chapter}:${verse}`, work, chapter, verse } : undefined,
      strategy: "SQL_ONLY",
      limits: { maxResults: DEFAULT_LIMITS.EXACT_REF_MAX_RESULTS, maxSegmentsForSynthesis: DEFAULT_LIMITS.EXACT_REF_MAX_SEGMENTS },
      disambiguation: !resolved.workName
        ? {
            required: true,
            reason: MESSAGES.DISAMBIG_BOOK_OR_MASEKHET,
            suggestions: [
              'נסה לכתוב את שם הספר בעברית מלאה, למשל: "בראשית 1:1"',
              'לפרק בתנ"ך כתוב: "ישעיה 40:1"',
              'למסכת משנה כתוב: "ברכות 3:1"',
            ],
          }
        : undefined,
      debug: { matchedRule: "EXACT_REF", notes },
    };
    return plan;
  }

  // WORD OCCURRENCES
  const occRegex = /(איפה מופיעה|היכן מופיע|היכן כתוב|הבא את כל המופעים|מופיע הביטוי|מופיעה המילה)/;
  if (occRegex.test(normalized)) {
    const quoted = normalized.match(/["“”'׳‘’](.+?)["“”'׳‘’]/);
    const term = quoted ? quoted[1] : normalized.replace(occRegex, "").trim().split(/\s+/)[0];
    let scope: ScopeConstraint = {};
    const scopeMatch = normalized.match(/ב([^ ]+)/);
    if (scopeMatch) {
      const res = resolveScopeNode(scopeMatch[1], reg);
      if (res.node) scope.node = res.node;
      if (res.workName) scope.work = res.workName;
    }
    const ch = normalized.match(chapterRegex);
    if (ch) scope.chapter = parseInt(ch[1], 10);
    const disambigNeeded = scope.chapter && !scope.work;
    return {
      intent: QueryIntent.WORD_OCCURRENCES,
      scope,
      term,
      strategy: "SQL_ONLY",
      limits: { maxResults: DEFAULT_LIMITS.WORD_OCCURRENCES_MAX_RESULTS, maxSegmentsForSynthesis: 0 },
      disambiguation: disambigNeeded
        ? {
            required: true,
            reason: MESSAGES.DISAMBIG_CHAPTER_NEEDS_WORK,
            suggestions: [
              `איפה מופיעה המילה "${term}" ב${scope.node?.name || "ספר"} פרק ${scope.chapter}?`,
              `איפה מופיעה המילה "${term}" בנביאים בספר ישעיה פרק ${scope.chapter}?`,
            ],
          }
        : undefined,
      debug: { matchedRule: "WORD_OCCURRENCES", notes },
    };
  }

  // CHAPTER ABOUT
  const chapterAbout = normalized.match(/(?:על מה מדבר|מה הנושא של)\s+פרק\s+(\d+)\s+ב(.+)/);
  if (chapterAbout) {
    const chapter = parseInt(chapterAbout[1], 10);
    const workRaw = chapterAbout[2].trim();
    const resolved = resolveScopeNode(workRaw, reg);
    const work = resolved.workName;
    const disambigNeeded = !work;
    return {
      intent: QueryIntent.CHAPTER_ABOUT,
      scope: { work, chapter },
      strategy: "HYBRID_SQL_THEN_LLM",
      limits: { maxResults: DEFAULT_LIMITS.CHAPTER_ABOUT_MAX_RESULTS, maxSegmentsForSynthesis: DEFAULT_LIMITS.CHAPTER_ABOUT_MAX_SEGMENTS },
      disambiguation: disambigNeeded
        ? {
            required: true,
            reason: MESSAGES.DISAMBIG_CHAPTER_WORK,
            suggestions: [
              `על מה מדבר פרק ${chapter} בישעיה?`,
              `מה הנושא של פרק ${chapter} בברכות?`,
            ],
          }
        : undefined,
      debug: { matchedRule: "CHAPTER_ABOUT", notes },
    };
  }

  // QUOTE ENTITY
  const quoteEntity = normalized.match(/משניות שמזכירות\s+(.+)/);
  if (quoteEntity) {
    const name = quoteEntity[1].trim();
    let scope: ScopeConstraint = {};
    const mScope = normalized.match(/במסכת\s+([^\s]+)/);
    if (mScope) {
      const res = resolveScopeNode(mScope[1], reg);
      if (res.node) scope.node = res.node;
      if (res.workName) scope.work = res.workName;
    }
    const sederScope = normalized.match(/בסדר\s+([^\s]+)/);
    if (sederScope) {
      scope.node = { type: ScopeNodeType.SUBCORPUS, name: sederScope[1] };
    }
    return {
      intent: QueryIntent.QUOTE_ENTITY,
      scope,
      term: name,
      strategy: "SQL_ONLY",
      limits: { maxResults: DEFAULT_LIMITS.QUOTE_ENTITY_MAX_RESULTS, maxSegmentsForSynthesis: 0 },
      debug: { matchedRule: "QUOTE_ENTITY", notes },
    };
  }

  // LIST WORKS (tractates) mentioning entity in Mishnah
  const listWorksPatterns = /(מסכתות|מסכתות במשנה|רשימה של כל המסכתות).*(מזכירות|מזכיר)/;
  const listWorksMatch = normalized.match(listWorksPatterns);
  if (listWorksMatch) {
    const mishnahMention = /במשנה/.test(normalized);
    if (!mishnahMention) {
      return {
        intent: QueryIntent.LIST_WORKS_MENTIONING_ENTITY,
        scope: {},
        strategy: "SQL_ONLY",
        limits: { maxResults: DEFAULT_LIMITS.LIST_WORKS_MAX_RESULTS, maxSegmentsForSynthesis: 0 },
        aggregateWorks: true,
        disambiguation: {
          required: true,
          reason: MESSAGES.DISAMBIG_TRACTATES_WHICH_CORPUS,
          suggestions: [
            "איזה מסכתות במשנה מזכירות את רבי עקיבא?",
            "איזה מסכתות בבבלי מזכירות את רבי עקיבא?",
          ],
        },
        debug: { matchedRule: "LIST_WORKS_MENTIONING_ENTITY", notes },
      };
    }
    const entityMatch = normalized.match(/מזכירות\s+(.+)/) || normalized.match(/מזכיר\s+(.+)/);
    const term = entityMatch ? entityMatch[1].trim().replace(/^את\s+/, "") : normalized;
    return {
      intent: QueryIntent.LIST_WORKS_MENTIONING_ENTITY,
      scope: { node: { type: ScopeNodeType.CORPUS, name: "mishnah" }, work: undefined },
      term,
      strategy: "SQL_ONLY",
      limits: { maxResults: DEFAULT_LIMITS.LIST_WORKS_MAX_RESULTS, maxSegmentsForSynthesis: 0 },
      aggregateWorks: true,
      debug: { matchedRule: "LIST_WORKS_MENTIONING_ENTITY", notes },
    };
  }

  // fallback GENERAL QA

  // Corpus quote query (e.g., מסכת סוטה שמצטטים פסוק מהתנ\"ך)
  const quotePattern = /(מצטט|מצטטים|ציטוט)/;
  const pasukPattern = /(פסוק|פסוקים)/;
  const tanakhPattern = /(תנ\"ך|מהתנ\"ך|מן התנ\"ך)/;
  if (quotePattern.test(normalized) && pasukPattern.test(normalized) && tanakhPattern.test(normalized)) {
    let scope: ScopeConstraint = {};
    const workMatch = normalized.match(/במסכת\s+([^\s]+)/);
    if (workMatch) {
      const res = resolveScopeNode(workMatch[1], reg);
      if (res.node) scope.node = res.node;
      if (res.workName) scope.work = res.workName;
      if (scope.node && !scope.work && scope.node.type === ScopeNodeType.WORK) {
        scope.work = scope.node.name;
      }
    }
    if (!scope.work) {
      return {
        intent: QueryIntent.CORPUS_QUOTE_QUERY,
        scope,
        strategy: "SQL_ONLY",
        limits: { maxResults: 50, maxSegmentsForSynthesis: 0 },
        disambiguation: {
          required: true,
          reason: MESSAGES.DISAMBIG_BOOK_OR_MASEKHET,
          suggestions: ["תן לי את כל המשניות במסכת סוטה שמצטטים פסוק מהתנ\"ך"],
        },
        debug: { matchedRule: "CORPUS_QUOTE_QUERY", notes },
      };
    }
    return {
      intent: QueryIntent.CORPUS_QUOTE_QUERY,
      scope,
      strategy: "SQL_ONLY",
      limits: { maxResults: 100, maxSegmentsForSynthesis: 0 },
      debug: { matchedRule: "CORPUS_QUOTE_QUERY", notes },
    };
  }

  return {
    intent: QueryIntent.GENERAL_QA,
    scope: {},
    strategy: "VECTOR_ONLY",
    limits: { maxResults: DEFAULT_LIMITS.GENERAL_QA_TOP_K, maxSegmentsForSynthesis: 0 },
    debug: { matchedRule: "GENERAL_QA", notes },
  };
}
