/**
 * Sanitize text for display: decode HTML entities, collapse whitespace, trim.
 */
export function sanitizeDisplayText(text: string | undefined | null): string {
  if (text == null) return "";
  let s = String(text);

  s = s.replace(/&nbsp;/gi, " ");
  s = s.replace(/&amp;/gi, "&");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&lt;/gi, "<");
  s = s.replace(/&gt;/gi, ">");
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

  s = s.replace(/\s+/g, " ").trim();
  return s;
}
