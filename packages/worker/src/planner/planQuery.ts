import { DEFAULT_LIMITS } from "../config/constants";
import { MESSAGES } from "../config/messages";
import { QueryIntent, ScopeConstraint, QueryPlan, ScopeNodeType, WorkRegistry } from "./types";
import { ensureRegistry } from "./scope/registry";
import { resolveScopeNode } from "./scope/resolver";
import { normalizeQueryForPlanning } from "./utils/normalizeQueryForPlanning";
import { parseRefFromQuery } from "./utils/parseRefFromQuery";
import { MISHNAH_TRACTATES_HEB_TO_CANONICAL } from "./scope/mappings/mishnahTractates";

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
  const normalized = normalizeQueryForPlanning(query);
  const notes: string[] = [];
  const note = hebrewPreferredNote(normalized);
  if (note) notes.push(note);

  // EXACT REF (digits or Hebrew numerals / phrasing)
  const parsedRef = parseRefFromQuery(normalized, reg);
  if (parsedRef) {
    const plan: QueryPlan = {
      intent: QueryIntent.EXACT_REF,
      scope: { work: parsedRef.work },
      ref: {
        raw: `${parsedRef.rawWork} ${parsedRef.chapter}:${parsedRef.verse}`,
        normalizedRef: parsedRef.normalizedRef,
        work: parsedRef.work,
        chapter: parsedRef.chapter,
        verse: parsedRef.verse,
      },
      strategy: "SQL_ONLY",
      limits: { maxResults: DEFAULT_LIMITS.EXACT_REF_MAX_RESULTS, maxSegmentsForSynthesis: DEFAULT_LIMITS.EXACT_REF_MAX_SEGMENTS },
      debug: { matchedRule: "EXACT_REF", notes },
    };
    return plan;
  }

  // WORD OCCURRENCES
  const occRegex = /(איפה מופיעה|היכן מופיע|היכן כתוב|הבא את כל המופעים|מופיע הביטוי|מופיעה המילה)/;
  if (occRegex.test(normalized)) {
    const quoted = normalized.match(/["“”'׳‘’](.+?)["“”'׳‘’]/);
    let term: string | undefined;
    if (quoted) {
      term = quoted[1];
    } else {
      const remainder = normalized.replace(occRegex, "").trim();
      const tokens = remainder.split(/\s+/).filter(Boolean);
      const stopwords = new Set(["המילה", "מילה", "הביטוי", "ביטוי", "מופיעה", "מופיע"]);
      const found = tokens.find((t) => !stopwords.has(t));
      term = found || tokens[0] || remainder;
    }
    term = term?.trim();
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

  // Generalized reference linking intent
  const refLinkPattern = /(מצוטט|מצטט|מצטטים|מצוטטים|ציטוט|ציטוטים|מאיפה|מה המקור|מקור|רפרנס)/;
  if (refLinkPattern.test(normalized)) {
    let scope: ScopeConstraint = {};
    const hebrewTractatesRef = Object.keys(MISHNAH_TRACTATES_HEB_TO_CANONICAL).sort((a, b) => b.length - a.length);
    for (const name of hebrewTractatesRef) {
      if (normalized.includes(`מסכת ${name}`) || normalized.includes(`במסכת ${name}`)) {
        const res = resolveScopeNode(name, reg);
        if (res.node) scope.node = res.node;
        if (res.workName) scope.work = res.workName;
        break;
      }
    }
    if (!scope.work) {
      const tractateMatch = normalized.match(/מסכת\s+([^\s]+)/);
      if (tractateMatch) {
        const res = resolveScopeNode(tractateMatch[1], reg);
        if (res.node) scope.node = res.node;
        if (res.workName) scope.work = res.workName;
      }
    }
    const byBook = normalized.match(/ב(?:ספר|מסכת)\s+([^\s]+)/);
    if (!scope.work && byBook) {
      const res = resolveScopeNode(byBook[1], reg);
      if (res.node) scope.node = res.node;
      if (res.workName) scope.work = res.workName;
    }
    const targetTypes: string[] = [];
    if (/(פסוק|פסוקים|תנ\"ך|מקרא)/.test(normalized)) targetTypes.push("tanakh");
    if (/(משנה|משניות)/.test(normalized)) targetTypes.push("mishnah");
    if (/(גמרא|בבלי|תלמוד)/.test(normalized)) targetTypes.push("bavli");
    const hasTractateMention = /מסכת\s+\S+/.test(normalized);
    const disambigNeeded = !scope.work && hasTractateMention;
    return {
      intent: QueryIntent.FIND_REFERENCES,
      scope,
      targetTypes: targetTypes.length ? targetTypes : undefined,
      strategy: "SQL_ONLY",
      limits: { maxResults: 200, maxSegmentsForSynthesis: 0 },
      disambiguation: disambigNeeded
        ? {
            required: true,
            reason: MESSAGES.DISAMBIG_BOOK_OR_MASEKHET,
            suggestions: ["לדוגמה: איזה פסוקים מצוטטים במסכת סוטה?"],
          }
        : undefined,
      debug: { matchedRule: "FIND_REFERENCES", notes },
    };
  }

  // fallback GENERAL QA

  // Corpus quote query (e.g., מסכת סוטה שמצטטים פסוק מהתנ\"ך)
  const quotePattern = /(מצטט|מצטטים|ציטוט)/;
  const pasukPattern = /(פסוק|פסוקים)/;
  const tanakhPattern = /(תנ\"ך|מהתנ\"ך|מן התנ\"ך)/;
  if (quotePattern.test(normalized) && pasukPattern.test(normalized) && tanakhPattern.test(normalized)) {
    let scope: ScopeConstraint = {};
    const hebrewTractatesCorpus = Object.keys(MISHNAH_TRACTATES_HEB_TO_CANONICAL).sort((a, b) => b.length - a.length);
    let tractateHebCorpus: string | null = null;
    for (const name of hebrewTractatesCorpus) {
      if (normalized.includes(`במסכת ${name}`) || normalized.includes(`מסכת ${name}`)) {
        tractateHebCorpus = name;
        break;
      }
    }
    if (tractateHebCorpus) {
      const res = resolveScopeNode(tractateHebCorpus, reg);
      if (res.node) scope.node = res.node;
      if (res.workName) scope.work = res.workName;
    } else {
      const workMatch = normalized.match(/במסכת\s+([^\s]+)/);
      if (workMatch) {
        const res = resolveScopeNode(workMatch[1], reg);
        if (res.node) scope.node = res.node;
        if (res.workName) scope.work = res.workName;
      }
    }
    if (scope.node && !scope.work && scope.node.type === ScopeNodeType.WORK) {
      scope.work = scope.node.name;
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

  // Mishnah quote query (tractate-specific)
  const quoteTractatePattern = /(מצוטט|מצוטטים|מצטט|מצטטות|ציטוט|ציטוטים)/;
  const tanakhHintPattern = /(פסוק|פסוקים|תנ\"ך|מקרא|מהתנ\"ך|מן התנ\"ך)/;
  const mishnahHintPattern = /(משנה|משניות|מסכת|במסכת)/;
  if (quoteTractatePattern.test(normalized) && tanakhHintPattern.test(normalized) && mishnahHintPattern.test(normalized)) {
    let scope: ScopeConstraint = { node: { type: ScopeNodeType.CORPUS, name: "mishnah" } };
    const hebrewTractates = Object.keys(MISHNAH_TRACTATES_HEB_TO_CANONICAL).sort((a, b) => b.length - a.length);
    let tractateHeb: string | null = null;
    for (const name of hebrewTractates) {
      if (normalized.includes(`מסכת ${name}`) || normalized.includes(`במסכת ${name}`)) {
        tractateHeb = name;
        break;
      }
    }
    if (tractateHeb) {
      const res = resolveScopeNode(tractateHeb, reg);
      if (res.workName) scope.work = res.workName;
    } else {
      const tractateMatch = normalized.match(/מסכת\s+([^\s]+)/);
      if (tractateMatch) {
        const res = resolveScopeNode(tractateMatch[1], reg);
        if (res.workName) scope.work = res.workName;
      }
    }
    if (!scope.work) {
      return {
        intent: QueryIntent.QUOTE_QUERY,
        scope,
        strategy: "SQL_ONLY",
        limits: { maxResults: 200, maxSegmentsForSynthesis: 0 },
        disambiguation: {
          required: true,
          reason: MESSAGES.DISAMBIG_BOOK_OR_MASEKHET,
          suggestions: ["ציין מסכת, למשל: \"איזה פסוקים מצוטטים במסכת סוטה?\""],
        },
        debug: { matchedRule: "QUOTE_QUERY", notes },
      };
    }
    return {
      intent: QueryIntent.QUOTE_QUERY,
      scope,
      strategy: "SQL_ONLY",
      limits: { maxResults: 200, maxSegmentsForSynthesis: 0 },
      debug: { matchedRule: "QUOTE_QUERY", notes },
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
