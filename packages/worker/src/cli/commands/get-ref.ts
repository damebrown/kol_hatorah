import minimist from "minimist";
import { getSQLiteManager } from "../sqlite";

export async function getRefCommand() {
  const argv = minimist(process.argv.slice(2));
  const ref = argv.ref;
  if (!ref) {
    console.error("Error: --ref is required");
    process.exit(1);
  }
  const sqlite = await getSQLiteManager();
  try {
    const row = sqlite.getRef(ref.trim());
    if (!row) {
      console.log(JSON.stringify({ found: false }));
    } else {
      console.log(JSON.stringify({ found: true, row }, null, 2));
    }
  } finally {
    sqlite.close();
  }
}
