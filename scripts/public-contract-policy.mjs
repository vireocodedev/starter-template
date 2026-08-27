import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  "CODE_OF_CONDUCT.md",
  "docs/starter-compatibility.md",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
];
const problems = [];

for (const path of requiredFiles) {
  if (!existsSync(join(root, path)))
    problems.push(`missing required public contract: ${path}`);
}

function requireText(path, fragments) {
  const text = readFileSync(join(root, path), "utf8");
  for (const fragment of fragments) {
    if (!text.includes(fragment))
      problems.push(`${path} must contain ${JSON.stringify(fragment)}`);
  }
  return text;
}

requireText("README.md", [
  "SUPPORT.md",
  "GOVERNANCE.md",
  "docs/starter-compatibility.md",
]);
requireText("SUPPORT.md", ["SECURITY.md", "CODE_OF_CONDUCT.md"]);
requireText("GOVERNANCE.md", [
  ".github/CODEOWNERS",
  "docs/starter-compatibility.md",
]);
const compatibility = requireText("docs/starter-compatibility.md", [
  "deprecation",
  "upgrade",
  "schema",
  "lockfiles",
  "deployment order",
]);

const frontendManifest = JSON.parse(
  readFileSync(join(root, "frontend/package.json"), "utf8"),
);
const starterDependencies = Object.entries(
  frontendManifest.dependencies,
).filter(([name]) => name.startsWith("@vireocodedev/"));
for (const [name, version] of starterDependencies) {
  if (!compatibility.includes(name) || !compatibility.includes(version))
    problems.push(
      `docs/starter-compatibility.md must reflect ${name} ${version}`,
    );
}

const gradleProperties = readFileSync(join(root, "gradle.properties"), "utf8");
const starterVersion = gradleProperties.match(/^starterVersion=(.+)$/m)?.[1];
if (!starterVersion || !compatibility.includes(starterVersion))
  problems.push(
    "docs/starter-compatibility.md must reflect gradle.properties starterVersion",
  );

for (const form of ["bug_report.yml", "feature_request.yml"]) {
  requireText(`.github/ISSUE_TEMPLATE/${form}`, [
    "name:",
    "description:",
    "body:",
  ]);
}
requireText(".github/ISSUE_TEMPLATE/config.yml", [
  "blank_issues_enabled: false",
  "contact_links:",
]);

const markdownFiles = [];
function collectMarkdown(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (
      [".git", "node_modules", "build", "dist", "storybook-static"].includes(
        entry.name,
      )
    )
      continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectMarkdown(path);
    else if (entry.isFile() && entry.name.endsWith(".md"))
      markdownFiles.push(path);
  }
}
collectMarkdown(root);

for (const source of markdownFiles) {
  const markdown = readFileSync(source, "utf8");
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (!rawTarget || /^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
    const target = decodeURIComponent(
      rawTarget.split("#", 1)[0].split("?", 1)[0],
    );
    if (!target) continue;
    const resolved = resolve(dirname(source), target);
    if (!existsSync(resolved))
      problems.push(`${relative(root, source)} links to missing ${rawTarget}`);
    else if (!statSync(resolved).isFile() && !statSync(resolved).isDirectory())
      problems.push(
        `${relative(root, source)} links to unsupported ${rawTarget}`,
      );
  }
}

if (problems.length > 0) {
  console.error("Public contract policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Public contract policy passed: ${requiredFiles.length} surfaces, ${starterDependencies.length} Starter dependencies, and ${markdownFiles.length} Markdown files checked.`,
);
