import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(frontendRoot, "package.json"), "utf8"));

const problems = [];
const starterDependencies = Object.entries(packageJson.dependencies ?? {}).filter(([name]) =>
  name.startsWith("@vireocodedev/starter-"),
);

for (const [name, version] of starterDependencies) {
  if (/^(?:file|link|workspace):/.test(version) || version.includes("../starter")) {
    problems.push(`${name} must resolve from the published registry, received ${version}.`);
  }
}

const publishedScripts = ["dev", "build", "test", "test:storybook", "test:e2e", "storybook", "build-storybook"];
for (const scriptName of publishedScripts) {
  const command = packageJson.scripts?.[scriptName];
  if (command?.includes("USE_LOCAL_STARTER")) {
    problems.push(`${scriptName} silently enables local Starter aliases.`);
  }
}

const publishedTsconfig = fs.readFileSync(path.join(frontendRoot, "tsconfig.app.json"), "utf8");
if (publishedTsconfig.includes("../../starter") || publishedTsconfig.includes("../starter/packages")) {
  problems.push("tsconfig.app.json references the local Starter checkout.");
}

if (starterDependencies.length === 0) {
  problems.push("No published Starter dependencies were found.");
}

if (problems.length > 0) {
  console.error("Published Starter boundary check failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Published Starter boundary passed for ${starterDependencies.length} packages.`);
