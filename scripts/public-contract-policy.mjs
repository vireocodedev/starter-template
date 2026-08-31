import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateReleasePolicy = JSON.parse(
  readFileSync(join(root, "contracts/template-release-policy.json"), "utf8"),
);
const templateReleaseRecovery = JSON.parse(
  readFileSync(
    join(root, "contracts/template-release-recovery.json"),
    "utf8",
  ),
);
const currentTemplateReleaseTagRuleset = JSON.parse(
  readFileSync(
    join(
      root,
      ".github/rulesets",
      `starter-template-${templateReleasePolicy.version}.json`,
    ),
    "utf8",
  ),
);
const historicalTemplateReleaseTagRuleset = JSON.parse(
  readFileSync(
    join(root, ".github/rulesets/starter-template-0.6.0.json"),
    "utf8",
  ),
);
const templateReleaseEnvironment = JSON.parse(
  readFileSync(
    join(root, ".github/environments/template-release.json"),
    "utf8",
  ),
);
const templateReleaseTag = templateReleasePolicy.tag;
const templateReleaseContract = "template-release-policy.json";
const templateReleaseContractUrl = `https://github.com/${templateReleasePolicy.repository}/blob/${encodeURIComponent(templateReleaseTag)}/contracts/${templateReleaseContract}`;
const currentTemplateReleaseTagRulesetPath = `.github/rulesets/starter-template-${templateReleasePolicy.version}.json`;
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
  "docs/provider-controls-2026-08-31.md",
  "docs/platform-support-evidence.md",
  "docs/verification-performance.md",
  "contracts/template-release-policy.json",
  "contracts/template-release-recovery.json",
  "contracts/project-upgrade-policy.json",
  currentTemplateReleaseTagRulesetPath,
  ".github/rulesets/starter-template-0.6.0.json",
  ".github/rulesets/main.json",
  ".github/environments/template-release.json",
  ".github/environments/template-release.deployment-branch-policies.json",
  ".github/environments/template-release.live-assertions.json",
  ".github/settings/actions.json",
  ".github/settings/selected-actions.json",
  ".github/settings/workflow-permissions.json",
  "scripts/template-release-policy.mjs",
  "scripts/template-release-recovery-policy.mjs",
  "scripts/repository-security-policy.mjs",
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
requireText("SUPPORT.md", [
  "Never move, delete, or recreate an immutable release tag.",
  "reviewed `main` workflow-dispatch path",
  "draft or published GitHub release",
  "`template-release` protected GitHub environment",
  "immutable releases are still enabled",
  "update-and-deletion tag ruleset",
  "active before recovery approval",
]);
if (templateReleaseRecovery.schemaVersion !== 1)
  problems.push("template release recovery schemaVersion must equal 1");
if (!/^starter-template@0\.6\.0$/u.test(templateReleaseRecovery.tag ?? ""))
  problems.push("template release recovery must retain the protected immutable 0.6.0 tag");
if (!/^[0-9a-f]{40}$/u.test(templateReleaseRecovery.expectedCommit ?? ""))
  problems.push(
    "template release recovery expectedCommit must be a lowercase 40-hex Git SHA",
  );
function validateImmutableTagRuleset({ ruleset, tag, role }) {
  const expectedRulesetRef = `refs/tags/${tag}`;
  if (ruleset.name !== `Protect ${tag}`)
    problems.push(`${role} release tag ruleset name must match ${tag}`);
  if (ruleset.target !== "tag")
    problems.push(`${role} release tag ruleset target must equal tag`);
  if (ruleset.enforcement !== "active")
    problems.push(`${role} release tag ruleset enforcement must equal active`);
  if (!Array.isArray(ruleset.bypass_actors) || ruleset.bypass_actors.length !== 0)
    problems.push(`${role} release tag ruleset bypass_actors must be empty`);
  const refName = ruleset.conditions?.ref_name;
  if (
    !Array.isArray(refName?.include) ||
    refName.include.length !== 1 ||
    refName.include[0] !== expectedRulesetRef ||
    !Array.isArray(refName.exclude) ||
    refName.exclude.length !== 0
  )
    problems.push(
      `${role} release tag ruleset must include exactly ${tag} and exclude no refs`,
    );
  const rules = ruleset.rules;
  if (
    !Array.isArray(rules) ||
    rules.length !== 2 ||
    new Set(rules.map((rule) => rule?.type)).size !== 2 ||
    !["update", "deletion"].every((type) =>
      rules.some((rule) => rule?.type === type),
    )
  )
    problems.push(
      `${role} release tag ruleset must contain exactly update and deletion rules`,
    );
}

validateImmutableTagRuleset({
  ruleset: currentTemplateReleaseTagRuleset,
  tag: templateReleasePolicy.tag,
  role: "current",
});
validateImmutableTagRuleset({
  ruleset: historicalTemplateReleaseTagRuleset,
  tag: templateReleaseRecovery.tag,
  role: "historical recovery",
});
if (templateReleaseEnvironment.wait_timer !== 0)
  problems.push("template release environment wait_timer must equal 0");
if (templateReleaseEnvironment.prevent_self_review !== false)
  problems.push(
    "template release environment prevent_self_review must equal false",
  );
const environmentReviewers = templateReleaseEnvironment.reviewers;
if (
  !Array.isArray(environmentReviewers) ||
  environmentReviewers.length !== 1 ||
  environmentReviewers[0]?.type !== "User" ||
  environmentReviewers[0]?.id !== 53398175
)
  problems.push(
    "template release environment must require exactly User reviewer 53398175",
  );
if (
  templateReleaseEnvironment.deployment_branch_policy?.protected_branches !== false ||
  templateReleaseEnvironment.deployment_branch_policy?.custom_branch_policies !== true ||
  JSON.stringify(
    JSON.parse(
      readFileSync(
        join(
          root,
          ".github/environments/template-release.deployment-branch-policies.json",
        ),
        "utf8",
      ),
    ),
  ) !==
    JSON.stringify([
      { name: "main", type: "branch" },
      { name: "starter-template@*", type: "tag" },
    ]) ||
  JSON.parse(
    readFileSync(
      join(root, ".github/environments/template-release.live-assertions.json"),
      "utf8",
    ),
  ).can_admins_bypass !== false
)
  problems.push(
    "template release environment must permit exactly main dispatches and template tags without administrator bypass",
  );
requireText("docs/generated-capabilities.md", [
  templateReleaseTag,
  templateReleaseContractUrl,
  `create-vireo@${templateReleasePolicy.createVireoVersion}`,
]);
const projectUpgradeContract = JSON.parse(
  readFileSync(join(root, "contracts/project-upgrade-policy.json"), "utf8"),
);
if (
  projectUpgradeContract.schemaVersion !== 1 ||
  projectUpgradeContract.contractId !== "vireo-template-project-upgrades" ||
  projectUpgradeContract.publicRelease !== templateReleasePolicy.version ||
  projectUpgradeContract.candidateRelease !== undefined ||
  projectUpgradeContract.previousRelease !== "0.6.0" ||
  projectUpgradeContract.publicationState !== "final" ||
  !projectUpgradeContract.supportedEdges?.some(
    (edge) =>
      edge.from === projectUpgradeContract.previousRelease &&
      edge.to === templateReleasePolicy.version &&
      edge.status === "supported",
  )
) {
  problems.push("project upgrade contract must declare the final adjacent upgrade coordinate");
}
if (
  projectUpgradeContract.targetTemplateCommit !== undefined ||
  projectUpgradeContract.finalization !== undefined ||
  projectUpgradeContract.lockfileRefreshCommands?.["full-stack"] !==
    "corepack npm install --package-lock-only --prefix frontend" ||
  projectUpgradeContract.lockfileRefreshCommands?.frontend !==
    "corepack npm install --package-lock-only"
) {
  problems.push("final project upgrade contract must derive profile-correct lock refresh commands without a self-referential Template SHA");
}
requireText("docs/project-upgrades.md", [
  "0.6.0-to-0.7.0",
  "vireo status",
  "package-lock-only",
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
if (!templateVerifier.includes("node scripts/repository-security-policy.mjs")) {
  problems.push(
    "scripts/verify-template.sh must enforce the repository security desired-state policy",
  );
}

const templateReleaseWorkflow = readFileSync(
  join(root, ".github/workflows/template-release.yml"),
  "utf8",
);
const templateReleaseRecoveryPolicy = readFileSync(
  join(root, "scripts/template-release-recovery-policy.mjs"),
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
  'node scripts/template-release-policy.mjs "$RELEASE_TAG"';
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

for (const fragment of [
  "workflow_dispatch:",
  "tag:",
  "required: true",
  "type: string",
  "group: release-${{ github.workflow }}-${{ inputs.tag || github.ref_name }}",
  "environment: template-release",
  "name: Checkout policy source",
  "ref: ${{ github.ref }}",
  "name: Reject non-main recovery dispatch",
  "if: github.event_name == 'workflow_dispatch'",
  'test "$GITHUB_REF" = "refs/heads/main"',
  "name: Checkout validated release tag",
  "ref: refs/tags/${{ steps.release-target.outputs.tag || steps.pushed-release-target.outputs.tag }}",
  "name: Resolve exact release target",
  "name: Resolve trusted recovery target",
  "node scripts/template-release-recovery-policy.mjs",
  "name: Require release absence before checkout",
  "name: Require expected release commit from origin/main",
  "name: Require trusted remote tag target before checkout",
  "name: Revalidate release absence and exact tag target",
  "gh release view",
  "name: Verify exact release target",
  "RELEASE_COMMIT: ${{ steps.release-target.outputs.commit || steps.pushed-release-target.outputs.commit }}",
  'run: env GITHUB_SHA="$RELEASE_COMMIT" ./scripts/verify-template.sh silent',
  'git rev-parse "refs/tags/$RELEASE_TAG^{commit}"',
  'git merge-base --is-ancestor "$EXPECTED_COMMIT" origin/main',
  'git rev-parse HEAD',
  'test "$tag_commit" = "$EXPECTED_COMMIT"',
  'test "$head_commit" = "$EXPECTED_COMMIT"',
  "printf 'tag=%s\\n' \"$RELEASE_TAG\" >> \"$GITHUB_OUTPUT\"",
  "printf 'commit=%s\\n' \"$GITHUB_SHA\" >> \"$GITHUB_OUTPUT\"",
  "corepack npm exec -- playwright install --with-deps chromium",
  '"${{ steps.release-target.outputs.commit || steps.pushed-release-target.outputs.commit }}"',
  'gh release create "${{ steps.release-target.outputs.tag || steps.pushed-release-target.outputs.tag }}"',
  'gh release edit "${{ steps.release-target.outputs.tag || steps.pushed-release-target.outputs.tag }}"',
]) {
  if (!templateReleaseWorkflow.includes(fragment))
    problems.push(
      `template release workflow must contain immutable recovery control ${JSON.stringify(fragment)}`,
    );
}

const currentReleasePolicyStep = templateReleaseWorkflow.match(
  /- name: Validate current release policy[\s\S]*?(?=\n      - name:|$)/u,
)?.[0];
if (
  !currentReleasePolicyStep?.includes("if: github.event_name == 'push'") ||
  !currentReleasePolicyStep.includes(
    'node scripts/template-release-policy.mjs "$RELEASE_TAG"',
  )
)
  problems.push(
    "template release workflow must validate the current release policy only for a tag push",
  );
const recoveryTargetStep = templateReleaseWorkflow.match(
  /- name: Resolve exact release target[\s\S]*?(?=\n      - name:|$)/u,
)?.[0];
if (
  !recoveryTargetStep?.includes(
    'node scripts/template-release-recovery-policy.mjs "$RUNNER_TEMP/template-release-recovery-target" "$RELEASE_TAG"',
  ) ||
  !recoveryTargetStep.includes('if [ "${{ github.event_name }}" = "push" ]; then')
)
  problems.push(
    "template release workflow must validate a trusted historical dispatch directly against the recovery contract after checkout",
  );

for (const fragment of [
  "explicit recovery tag must exactly match the recovery contract",
  "template release recovery may target only the protected immutable 0.6.0 tag",
  "template release recovery expectedCommit must be a lowercase 40-hex Git SHA",
  "`tag=${recovery.tag}\\ncommit=${recovery.expectedCommit}\\n`",
]) {
  if (!templateReleaseRecoveryPolicy.includes(fragment))
    problems.push(
      `template release recovery policy must contain ${JSON.stringify(fragment)}`,
    );
}

const sourceCheckout = templateReleaseWorkflow.indexOf("name: Checkout policy source");
const nodeSetup = templateReleaseWorkflow.indexOf(
  "uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
);
const mainDispatchGuard = templateReleaseWorkflow.indexOf(
  "name: Reject non-main recovery dispatch",
);
const sourcePreflight = templateReleaseWorkflow.indexOf(releasePreflight);
const recoveryResolution = templateReleaseWorkflow.indexOf(
  "name: Resolve trusted recovery target",
);
const absenceBeforeCheckout = templateReleaseWorkflow.indexOf(
  "name: Require release absence before checkout",
);
const originMainContainment = templateReleaseWorkflow.indexOf(
  "name: Require expected release commit from origin/main",
);
const remoteBeforeCheckout = templateReleaseWorkflow.indexOf(
  "name: Require trusted remote tag target before checkout",
);
const tagCheckout = templateReleaseWorkflow.indexOf(
  "name: Checkout validated release tag",
);
const tagResolution = templateReleaseWorkflow.indexOf(
  "name: Resolve exact release target",
);
const exactTargetVerification = templateReleaseWorkflow.indexOf(
  "name: Verify exact release target",
);
const releaseManifest = templateReleaseWorkflow.indexOf(
  "node scripts/write-template-release-manifest.mjs",
);
const absenceBeforeCreate = templateReleaseWorkflow.indexOf(
  "name: Revalidate release absence and exact tag target",
);
const releaseCreate = templateReleaseWorkflow.indexOf("gh release create");
if (!(sourceCheckout < nodeSetup && nodeSetup < mainDispatchGuard && mainDispatchGuard < sourcePreflight && sourcePreflight < recoveryResolution && recoveryResolution < originMainContainment && originMainContainment < absenceBeforeCheckout && absenceBeforeCheckout < remoteBeforeCheckout && remoteBeforeCheckout < tagCheckout && tagCheckout < tagResolution && tagResolution < exactTargetVerification && exactTargetVerification < releaseManifest && releaseManifest < absenceBeforeCreate && absenceBeforeCreate < releaseCreate)) {
  problems.push(
    "template release workflow must verify the exact resolved target before writing its manifest and creating a release",
  );
}

const verifyTemplateWorkflowLines = templateReleaseWorkflow
  .split("\n")
  .filter((line) => line.includes("./scripts/verify-template.sh silent"));
if (
  verifyTemplateWorkflowLines.length !== 1 ||
  verifyTemplateWorkflowLines[0].trim() !==
    'run: env GITHUB_SHA="$RELEASE_COMMIT" ./scripts/verify-template.sh silent'
)
  problems.push(
    "template release workflow must invoke verify-template exactly once with the resolved release commit as GITHUB_SHA",
  );

const releaseIdentityCommands = templateReleaseWorkflow
  .split("\n")
  .filter((line) =>
    /(?:write-template-release-manifest\.mjs|gh release (?:create|edit))/u.test(
      line,
    ),
  );
for (const unsafeIdentity of releaseIdentityCommands) {
  if (/(?:GITHUB_(?:SHA|REF_NAME)|github\.(?:sha|ref_name))/u.test(unsafeIdentity))
    problems.push(
      `template release workflow must not use unverified GitHub identity ${JSON.stringify(unsafeIdentity)}`,
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
