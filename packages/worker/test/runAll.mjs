import { readdirSync } from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const testDir = __dirname;

let exit = 0;
for (const f of readdirSync(testDir).filter((x) => x.endsWith(".test.ts")).sort()) {
  const full = join(testDir, f);
  console.log("==>", join("test", f));
  const r = spawnSync("npx", ["tsx", full], { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (r.status) {
    exit = r.status;
    break;
  }
}
process.exit(exit);
