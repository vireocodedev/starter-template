import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = ["scripts/verify.sh", "frontend/scripts/verify.sh"];
const problems = [];

for (const relativePath of scripts) {
  const source = await readFile(path.join(repositoryRoot, relativePath), "utf8");

  if (!/^set -[a-z]*o pipefail$/m.test(source)) {
    problems.push(`${relativePath} must enable pipefail`);
  }
  if (!/step_exit_code=\$\{PIPESTATUS\[0\]\}/.test(source)) {
    problems.push(`${relativePath} must capture the command status before accepting tee output`);
  }
  if (/if\s+!\s+bash\s+-lc[^\n]*\|\s*tee/.test(source)) {
    problems.push(`${relativePath} must not test tee's pipeline status through a negated if`);
  }
}

if (problems.length > 0) {
  console.error("Verification pipeline policy failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Verification pipeline policy passed for ${scripts.length} scripts.`);
