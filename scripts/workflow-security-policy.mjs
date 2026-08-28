import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowRoot = join(repositoryRoot, ".github", "workflows");
const policy = JSON.parse(
  readFileSync(
    join(repositoryRoot, "contracts", "github-actions-policy.json"),
    "utf8",
  ),
);
const workflowFiles = readdirSync(workflowRoot)
  .filter((file) => /\.ya?ml$/u.test(file))
  .sort();
const observed = new Set();
const problems = [];

for (const fileName of workflowFiles) {
  const lines = readFileSync(join(workflowRoot, fileName), "utf8").split("\n");
  if (!lines.some((line) => /^permissions:\s*\{\}\s*$/u.test(line))) {
    problems.push(`${fileName} must default to permissions: {}`);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const use = line.match(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/u)?.[1];
    if (use) {
      const separator = use.lastIndexOf("@");
      const action = separator >= 0 ? use.slice(0, separator) : use;
      const revision = separator >= 0 ? use.slice(separator + 1) : "";
      const expected = policy.actions[action];
      if (!expected)
        problems.push(
          `${fileName}:${index + 1} uses unapproved action ${action}`,
        );
      else if (revision !== expected)
        problems.push(
          `${fileName}:${index + 1} must pin ${action}@${expected}`,
        );
      else observed.add(action);
    }
    if (/^\s+runs-on:\s*ubuntu-latest\s*$/u.test(line)) {
      problems.push(
        `${fileName}:${index + 1} must use ${policy.canonicalRunner}, not ubuntu-latest`,
      );
    }
    if (/^\s+run:\s+(?:npm|npx)(?:\s|$)/u.test(line)) {
      problems.push(
        `${fileName}:${index + 1} must select npm through Corepack`,
      );
    }
  }
}

for (const action of Object.keys(policy.actions)) {
  if (!observed.has(action))
    problems.push(`Action policy contains unused entry ${action}`);
}

const secretScan = readFileSync(
  join(repositoryRoot, "scripts", "secret-scan.sh"),
  "utf8",
);
const gitleaksConfig = readFileSync(
  join(repositoryRoot, ".gitleaks.toml"),
  "utf8",
);
if (!secretScan.includes("--config /repo/.gitleaks.toml")) {
  problems.push("Secret scanner must load the repository Gitleaks policy");
}
for (const requiredPolicy of [
  "useDefault = true",
  'condition = "AND"',
  'regexTarget = "line"',
  "secret scans, signed/provenanced releases",
  "^docs/security-threat-model\\.md$",
]) {
  if (!gitleaksConfig.includes(requiredPolicy)) {
    problems.push(`Gitleaks policy must include ${requiredPolicy}`);
  }
}
for (const [image, expected] of Object.entries(policy.containerImages ?? {})) {
  const pinnedReference = `${image}@${expected.digest}`;
  if (!secretScan.includes(pinnedReference)) {
    problems.push(
      `Secret scanner must pin ${image} ${expected.version} to ${expected.digest}`,
    );
  }
}

if (problems.length > 0) {
  console.error("Workflow security policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Workflow security policy passed: ${workflowFiles.length} workflows, ${observed.size} pinned actions, ${Object.keys(policy.containerImages ?? {}).length} pinned scanner images.`,
);
