import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const declaredPackageManager = JSON.parse(
  readFileSync(resolve(repositoryRoot, "frontend", "package.json"), "utf8"),
).packageManager;
const [scenario, result, outputArgument] = process.argv.slice(2);

if (!scenario || !result || !outputArgument || process.argv.length !== 5) {
  console.error(
    "Usage: node scripts/write-support-evidence.mjs <scenario> <result> <output-file>",
  );
  process.exit(2);
}
if (!/^[a-z0-9][a-z0-9-]*$/u.test(scenario))
  throw new Error(`Invalid evidence scenario: ${scenario}`);
if (!new Set(["success", "failure", "cancelled"]).has(result))
  throw new Error(`Invalid evidence result: ${result}`);

function version(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .trim()
      .split("\n")[0];
  } catch {
    return undefined;
  }
}

const details = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith("VIREO_EVIDENCE_"))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => [
      key.slice("VIREO_EVIDENCE_".length).toLowerCase(),
      value,
    ]),
);
const evidence = {
  schemaVersion: 1,
  scenario,
  result,
  recordedAt: new Date().toISOString(),
  source: {
    repository:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
        : undefined,
    commit: process.env.GITHUB_SHA ?? version("git", ["rev-parse", "HEAD"]),
    workflow: process.env.GITHUB_WORKFLOW,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
  },
  environment: {
    os: process.env.RUNNER_OS ?? process.platform,
    architecture: process.env.RUNNER_ARCH ?? process.arch,
    runnerImage: process.env.ImageOS,
    node: process.version,
    npm:
      version("corepack", ["npm", "--version"]) ||
      `${declaredPackageManager} via Corepack`,
    java: version("java", ["--version"]),
  },
  details,
};

const output = resolve(outputArgument);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Wrote ${scenario} support evidence (${result}) to ${output}.`);
