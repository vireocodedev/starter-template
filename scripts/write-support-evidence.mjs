import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const frontendManifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, "frontend", "package.json"), "utf8"),
);
const declaredPackageManager = frontendManifest.packageManager;
const platformPolicy = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "contracts", "platform-support-policy.json"),
    "utf8",
  ),
);
const gradleProperties = readFileSync(
  resolve(repositoryRoot, "gradle.properties"),
  "utf8",
);
const starterJvmVersion = gradleProperties.match(
  /^starterVersion=(.+)$/mu,
)?.[1];
const playwrightManifestPath = resolve(
  repositoryRoot,
  "frontend",
  "node_modules",
  "@playwright",
  "test",
  "package.json",
);
const playwrightBrowsersPath = resolve(
  repositoryRoot,
  "frontend",
  "node_modules",
  "playwright-core",
  "browsers.json",
);
const playwrightVersion = existsSync(playwrightManifestPath)
  ? JSON.parse(readFileSync(playwrightManifestPath, "utf8")).version
  : undefined;
const playwrightBrowsers = existsSync(playwrightBrowsersPath)
  ? Object.fromEntries(
      JSON.parse(readFileSync(playwrightBrowsersPath, "utf8"))
        .browsers.filter((browser) =>
          ["chromium", "firefox", "webkit"].includes(browser.name),
        )
        .map((browser) => [
          browser.name,
          {
            browserVersion: browser.browserVersion,
            revision: browser.revision,
          },
        ]),
    )
  : undefined;
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
  platformPolicyVersion: platformPolicy.policyVersion,
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
    playwright: playwrightVersion,
    playwrightBrowsers,
  },
  artifacts: {
    npm: Object.fromEntries(
      Object.entries(frontendManifest.dependencies).filter(([name]) =>
        name.startsWith("@vireocodedev/"),
      ),
    ),
    jvm: starterJvmVersion,
  },
  details,
};

const output = resolve(outputArgument);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Wrote ${scenario} support evidence (${result}) to ${output}.`);
