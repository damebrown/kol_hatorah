const smartDouble = /[”“״„]/g;
const smartSingle = /[‘’‚׳]/g;

export function normalizeQueryInput(input: string): string {
  let q = input || "";
  q = q.replace(smartDouble, '"').replace(smartSingle, "'");
  q = q.replace(/\s+/g, " ").trim();
  // If unmatched trailing quote, strip a single trailing quote char
  const stripTrailing = (quote: string) => {
    if (!q) return;
    const count = (q.match(new RegExp(`\\${quote}`, "g")) || []).length;
    if (count % 2 !== 0 && q.endsWith(quote)) {
      q = q.slice(0, -1).trimEnd();
    }
  };
  stripTrailing('"');
  stripTrailing("'");
  return q;
}
