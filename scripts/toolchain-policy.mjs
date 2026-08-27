import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = readJson("contracts/toolchain-policy.json");
const platformPolicy = readJson("contracts/platform-support-policy.json");
const frontendManifest = readJson("frontend/package.json");
const frontendLock = readJson("frontend/package-lock.json");
const build = readFile("build.gradle");
const wrapper = readFile("gradle/wrapper/gradle-wrapper.properties");
const workflow = readFile(".github/workflows/ci.yml");
const problems = [];

function readFile(path) {
  return readFileSync(join(repositoryRoot, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readFile(path));
}

function expectEqual(label, actual, expected) {
  if (actual !== expected)
    problems.push(`${label}: expected ${expected}, found ${String(actual)}`);
}

function expectText(label, source, expected) {
  if (!source.includes(expected))
    problems.push(`${label}: missing ${expected}`);
}

expectEqual(
  "platform Node exact",
  policy.node,
  platformPolicy.toolchains.node.exact,
);
expectEqual(
  "platform Node range",
  policy.nodeRange,
  platformPolicy.toolchains.node.range,
);
expectEqual("platform npm", policy.npm, platformPolicy.toolchains.npm.exact);
expectEqual(
  "platform Java",
  policy.java,
  platformPolicy.toolchains.java.compile,
);
expectEqual("platform Gradle", policy.gradle, platformPolicy.toolchains.gradle);
expectEqual(
  "platform Spring Boot",
  policy.springBoot,
  platformPolicy.toolchains.springBoot,
);
expectEqual(
  "platform canonical runner",
  policy.canonicalRunner,
  platformPolicy.canonicalHost.os,
);

expectEqual(
  "frontend engines.node",
  frontendManifest.engines?.node,
  policy.nodeRange,
);
expectEqual("frontend engines.npm", frontendManifest.engines?.npm, policy.npm);
expectEqual(
  "frontend packageManager",
  frontendManifest.packageManager,
  `npm@${policy.npm}`,
);
expectEqual(
  "frontend devEngines runtime",
  frontendManifest.devEngines?.runtime?.version,
  policy.nodeRange,
);
expectEqual(
  "frontend devEngines package manager",
  frontendManifest.devEngines?.packageManager?.version,
  policy.npm,
);
expectEqual(
  "lockfile engines.node",
  frontendLock.packages?.[""]?.engines?.node,
  policy.nodeRange,
);
expectEqual(
  "lockfile engines.npm",
  frontendLock.packages?.[""]?.engines?.npm,
  policy.npm,
);
expectText("Java toolchain", build, `JavaLanguageVersion.of(${policy.java})`);
expectText(
  "Spring Boot plugin",
  build,
  `org.springframework.boot' version '${policy.springBoot}'`,
);
expectText("Gradle wrapper", wrapper, `gradle-${policy.gradle}-bin.zip`);
expectText(
  "canonical CI runner",
  workflow,
  `runs-on: ${policy.canonicalRunner}`,
);
expectText("canonical CI Node", workflow, `node-version: ${policy.node}`);

const runtimeMajor = Number(process.versions.node.split(".")[0]);
if (runtimeMajor !== 24)
  problems.push(
    `runtime Node: expected major 24, found ${process.versions.node}`,
  );
const npmUserAgent = process.env.npm_config_user_agent ?? "";
if (!npmUserAgent.startsWith(`npm/${policy.npm} `)) {
  problems.push(
    `runtime npm: invoke through Corepack npm ${policy.npm}; found ${npmUserAgent || "no npm user agent"}`,
  );
}

if (problems.length > 0) {
  console.error("Toolchain policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Toolchain policy passed: Node ${policy.node}, npm ${policy.npm}, Java ${policy.java}, Gradle ${policy.gradle}, Spring Boot ${policy.springBoot}.`,
);
