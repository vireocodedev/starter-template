import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const wrapper = process.platform === "win32" ? "gradlew.bat" : "gradlew";

if (!existsSync(resolve(root, wrapper))) {
  console.error("[VIR-SETUP-001] Gradle wrapper is missing. Restore it from version control.");
  process.exit(1);
}

console.log("Installing the locked frontend dependencies...");
const result = spawnSync("corepack", ["npm", "ci", "--prefix", "frontend"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.status !== 0) process.exit(result.status ?? 1);

console.log("Setup complete. Run `npm run doctor`, then `npm run dev`.");
