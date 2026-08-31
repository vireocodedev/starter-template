import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateReleasePolicy = JSON.parse(
  readFileSync(join(root, "contracts/template-release-policy.json"), "utf8"),
);
const templateReleaseTag = templateReleasePolicy.tag;
const templateReleaseContract = "template-release-policy.json";
const templateReleaseContractUrl = `https://github.com/${templateReleasePolicy.repository}/blob/${encodeURIComponent(templateReleaseTag)}/contracts/${templateReleaseContract}`;
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  "CODE_OF_CONDUCT.md",
  "docs/starter-compatibility.md",
  "docs/project-upgrades.md",
  "docs/getting-started.md",
  "docs/generated-capabilities.md",
  "docs/customizing-the-template.md",
  "docs/project-upgrades.md",
  "docs/deployment.md",
  "docs/flagship-demo.md",
  "docs/flagship.md",
  "docs/flagship-architecture.md",
  "docs/comparison.md",
  "docs/security-threat-model.md",
  "docs/security-hardening.md",
  "docs/operations.md",
  "docs/database-recovery.md",
  "docs/incident-response.md",
  "docs/offline.md",
  "docs/accessibility.md",
  "docs/manual-platform-checklist.md",
  "docs/platform-support-evidence.md",
  "docs/verification-performance.md",
  "contracts/template-release-policy.json",
  "scripts/template-release-policy.mjs",
  "scripts/write-template-release-manifest.mjs",
  ".github/workflows/template-release.yml",
  "contracts/platform-support-policy.json",
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
  "docs/getting-started.md",
  "docs/customizing-the-template.md",
  "docs/deployment.md",
  "docs/flagship-demo.md",
  "docs/flagship.md",
  "docs/comparison.md",
  "docs/security-threat-model.md",
  "docs/security-hardening.md",
  "docs/operations.md",
  "docs/database-recovery.md",
  "docs/incident-response.md",
  "docs/offline.md",
  "docs/accessibility.md",
  "docs/manual-platform-checklist.md",
  "docs/EVALUATION.md",
  "docs/PUBLIC_API.md",
  "docs/TEMPORAL_VALUES.md",
]);
requireText("README.md", [
  templateReleaseTag,
  templateReleaseContract,
  `create-vireo@${templateReleasePolicy.createVireoVersion}`,
  "validates that exact tag before it can publish",
]);
requireText("SUPPORT.md", ["SECURITY.md", "CODE_OF_CONDUCT.md"]);
requireText("SECURITY.md", [templateReleaseTag, templateReleaseContract]);
requireText("SUPPORT.md", [templateReleaseTag, templateReleaseContract]);
requireText("docs/generated-capabilities.md", [
  templateReleaseTag,
  templateReleaseContractUrl,
  `create-vireo@${templateReleasePolicy.createVireoVersion}`,
]);
requireText("docs/project-upgrades.md", [
  "no adjacent path",
  "is declared yet",
]);
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

const executableDocumentationClaims = [
  {
    documentation: "README.md",
    documentedCommand: "corepack npm run setup",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "corepack npm run setup",
  },
  {
    documentation: "README.md",
    documentedCommand: "./scripts/verify.sh",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "./scripts/verify-template.sh silent",
  },
  {
    documentation: "README.md",
    documentedCommand: "./scripts/verify-deployment.sh",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "./scripts/verify-deployment.sh",
  },
  {
    documentation: "docs/database-recovery.md",
    documentedCommand: "./scripts/verify-database-recovery.sh",
    evidence: ".github/workflows/support-evidence.yml",
    evidenceCommand: "./scripts/verify-database-recovery.sh",
  },
];

for (const claim of executableDocumentationClaims) {
  const documentation = readFileSync(join(root, claim.documentation), "utf8");
  const evidence = readFileSync(join(root, claim.evidence), "utf8");
  if (!documentation.includes(claim.documentedCommand)) {
    problems.push(
      `${claim.documentation} must document executable command ${claim.documentedCommand}`,
    );
  }
  if (!evidence.includes(claim.evidenceCommand)) {
    problems.push(
      `${claim.evidence} must execute documented command ${claim.evidenceCommand}`,
    );
  }
}

const templateVerifier = readFileSync(
  join(root, "scripts/verify-template.sh"),
  "utf8",
);
if (!templateVerifier.includes("./scripts/verify.sh")) {
  problems.push(
    "scripts/verify-template.sh must invoke the application verifier explicitly",
  );
}
if (!templateVerifier.includes("node scripts/template-release-policy.mjs")) {
  problems.push(
    "scripts/verify-template.sh must enforce the template release policy",
  );
}

const templateReleaseWorkflow = readFileSync(
  join(root, ".github/workflows/template-release.yml"),
  "utf8",
);
for (const fragment of [
  "starter-template@*",
  "./scripts/verify-template.sh silent",
  "node scripts/template-release-policy.mjs",
  "node scripts/write-template-release-manifest.mjs",
  "gh release create",
  "--verify-tag",
]) {
  if (!templateReleaseWorkflow.includes(fragment))
    problems.push(
      `template release workflow must contain ${JSON.stringify(fragment)}`,
    );
}
const releasePreflight =
  'node scripts/template-release-policy.mjs "$GITHUB_REF_NAME"';
const releaseSetup = "corepack npm run setup";
if (
  templateReleaseWorkflow.indexOf(releasePreflight) < 0 ||
  templateReleaseWorkflow.indexOf(releasePreflight) >
    templateReleaseWorkflow.indexOf(releaseSetup)
) {
  problems.push(
    "template release workflow must validate its exact tag before setup",
  );
}

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
console.log(
  `${executableDocumentationClaims.length} documented commands are bound to hosted execution evidence.`,
);
