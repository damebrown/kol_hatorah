import minimist from "minimist";
import { normalizeText } from "@kol-hatorah/core";
import { getSQLiteManager } from "../../storage/sqlite";

export async function lexFindCommand() {
  const argv = minimist(process.argv.slice(2));
  const term = argv.term || argv.t;
  const scope = argv.scope || argv.type;
  const work = argv.work;
  const limit = parseInt(argv.limit || "20", 10);
  const context = parseInt(argv.context || "120", 10);

  if (!term) {
    console.error("Usage: lex-find --term <term> [--scope tanakh|mishnah|bavli] [--work WorkName] [--limit 20]");
    process.exit(1);
  }

  const sqlite = await getSQLiteManager();
  try {
    const norm = normalizeText(term);
    const rows = sqlite.findTerm(norm.textNorm, { type: scope, work }, limit);
    const total = sqlite.countTerm(norm.textNorm, { type: scope, work });
    const hits = rows.map((r: any, idx: number) => {
      const idxTerm = r.textPlain.indexOf(term);
      const start = Math.max(0, idxTerm >= 0 ? idxTerm - Math.floor(context / 2) : 0);
      const end = Math.min(r.textPlain.length, start + context);
      const snippet = r.textPlain.slice(start, end);
      return {
        idx: idx + 1,
        work: r.work,
        ref: r.ref,
        type: r.type,
        snippet,
      };
    });
    console.log(JSON.stringify({ total, hits }, null, 2));
  } finally {
    sqlite.close();
  }
}
