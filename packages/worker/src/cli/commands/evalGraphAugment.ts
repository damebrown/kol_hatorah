import minimist from "minimist";
import { runGraphAugmentEval } from "../../eval/graphAugmentEval";

/**
 * Runs 12 fixed Hebrew questions twice (graph off / on) and writes eval/graph_augmented_retrieval_report.md.
 */
export async function evalGraphAugmentCommand() {
  const argv = minimist(process.argv.slice(3));
  const out = argv.out || argv.o;
  const limitRaw = argv.k ?? argv.limit;
  const limitParsed =
    limitRaw !== undefined && limitRaw !== null && String(limitRaw) !== ""
      ? parseInt(String(limitRaw), 10)
      : NaN;
  const limit = Number.isFinite(limitParsed) ? limitParsed : undefined;

  const pathWritten = await runGraphAugmentEval({
    outPath: typeof out === "string" ? out : undefined,
    limit,
    onProgress: (m) => console.error(m),
  });

  console.error("Graph augment eval complete.");
  console.log(pathWritten);
  process.exit(0);
}
