# Mishnah → Tanakh Verse Resolution Pipeline

## Call Chain

1. **runMishnahParenRefs** (`runMishnahParenRefs.ts`)
   - Fetches Mishnah segments via `sqlite.getSegments(scope)`
   - Extracts markers via `MishnahParentheticalTanakhRefExtractor.extractWithContext`
   - Links to Tanakh via `linkExplicitTanakhRef` → `sqlite.getByPrefix(normalizedRefPrefix)`
   - For chapter-only refs: calls `extractQuoteWindow` + `resolveVerseFromChapter`

2. **extractQuoteWindow** (`quoteWindow/extractQuoteWindow.ts`)
   - Extracts substring around marker (before + after)
   - Detects boilerplate ("עד שגומר כל הפרשה") → returns empty
   - Prefers non-boilerplate; looks for introducers (שנאמר, דכתיב)

3. **Token normalization** (`quoteWindow/extractQuoteWindow.ts` → `normalizeForMatching`)
   - HTML entities, maqaf→space, bracket variants, niqqud, final letters
   - Then `normalizeText` from core (punctuation, whitespace)

4. **resolveVerseFromChapter** (`resolveVerseFromQuote.ts`)
   - `tokenizeSignificant(quoteWindow)` → tokens (with stopword filter)
   - For each chapter verse: `scoreOverlap` (base + contiguous bonus)
   - `passed` = sharedTokens>=2, sharedTokens>=MIN_SHARED_TOKENS, score>=MIN_SCORE_CONFIRMED
   - When quoteTokens<6: also requires contiguous>=3
   - Dedupes by verseNum, returns top passed

5. **Fallback when NONE**
   - Uses chapter-level ref (no verse text)
   - `verseStatus = "לא אותר פסוק מדויק"`
   - No first-verse text shown (was masking failure)

## Debug (--debug-reflink)

- mishnahExcerpt, markerRaw, markerParsed
- quoteWindowRaw, quoteWindowNorm, quoteTokensList
- Top 10 candidates: refHeb, sharedTokens, score, contiguousLength, decisionReason
- decision + decisionReason
- FALLBACK_USED when applicable
