import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalMavenGroup, validateArtifactCoordinateBinding, validatePreparedArtifactBinding } from "./template-release-artifacts.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateReleasePolicy = JSON.parse(
  readFileSync(join(root, "contracts/template-release-policy.json"), "utf8"),
);
const templateReleaseRecovery = JSON.parse(
  readFileSync(join(root, "contracts/template-release-recovery.json"), "utf8"),
);
const templateReleaseArtifacts = JSON.parse(
  readFileSync(join(root, "contracts/template-release-artifacts.json"), "utf8"),
);
const projectUpgradeContract = JSON.parse(
  readFileSync(join(root, "contracts/project-upgrade-policy.json"), "utf8"),
);
const templateReleaseTagRuleset = JSON.parse(
  readFileSync(
    join(root, ".github/rulesets", "starter-template-tags.json"),
    "utf8",
  ),
);
const supersededTemplateOnlyRelease = projectUpgradeContract.supportedEdges?.find(
  (edge) =>
    edge.status === "historical" &&
    typeof edge.note === "string" &&
    edge.note.includes("no paired public create-vireo@0.8.5 release existed"),
)?.to;
const retainedTemplateReleaseTags = [
  templateReleaseRecovery.tag,
  `starter-template@${projectUpgradeContract.previousRelease}`,
  supersededTemplateOnlyRelease &&
    `starter-template@${supersededTemplateOnlyRelease}`,
].filter(
  (tag, index, tags) =>
    typeof tag === "string" &&
    tag !== templateReleasePolicy.tag &&
    tags.indexOf(tag) === index,
);
const retainedTemplateReleaseTagRulesets = retainedTemplateReleaseTags.map(
  (tag) => ({
    tag,
    ruleset: JSON.parse(
      readFileSync(
        join(root, ".github/rulesets", `${tag.replace("@", "-")}.json`),
        "utf8",
      ),
    ),
  }),
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
const templateReleaseTagRulesetPath = ".github/rulesets/starter-template-tags.json";
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
  "docs/template-release-preparation.md",
  "contracts/template-release-policy.json",
  "contracts/template-release-artifacts.json",
  "contracts/vireo-release-signing-key.asc",
  "contracts/template-release-recovery.json",
  "contracts/project-upgrade-policy.json",
  templateReleaseTagRulesetPath,
  ...retainedTemplateReleaseTags.map(
    (tag) => `.github/rulesets/${tag.replace("@", "-")}.json`,
  ),
  ".github/rulesets/main.json",
  ".github/environments/template-release.json",
  ".github/environments/template-release.deployment-branch-policies.json",
  ".github/environments/template-release.live-assertions.json",
  ".github/environments/template-preparation.json",
  ".github/environments/template-preparation.deployment-branch-policies.json",
  ".github/environments/template-preparation.live-assertions.json",
  ".github/environments/template-preparation.required-credentials.json",
  ".github/settings/template-release-automation.required-variables.json",
  ".github/settings/actions.json",
  ".github/settings/selected-actions.json",
  ".github/settings/workflow-permissions.json",
  "scripts/template-release-policy.mjs",
  "scripts/template-release-prepare.mjs",
  "scripts/template-release-preparation-workflow.mjs",
  "scripts/template-release-preparation-reconciler.mjs",
  "scripts/template-release-artifacts.mjs",
  "scripts/template-release-coordinate-change.mjs",
  "scripts/template-release-reconciliation.mjs",
  "scripts/template-release-state.mjs",
  "scripts/template-release-recovery-policy.mjs",
  "scripts/repository-security-policy.mjs",
  "scripts/write-template-release-manifest.mjs",
  "deploy/hetzner/flagship-deployment-bundle.mjs",
  "deploy/hetzner/flagship-host-deploy.sh",
  "deploy/hetzner/vireo-flagship-ingress.sh",
  ".github/workflows/template-release.yml",
  ".github/workflows/template-release-recover.yml",
  ".github/workflows/template-release-preparation.yml",
  ".github/workflows/template-release-preparation-reconcile.yml",
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
  "https://vireocode.com/docs/",
  "npm create vireo@latest operations",
  "npm create vireo@latest operations-ui -- --profile frontend",
  "corepack npm run setup",
  "corepack npm run doctor",
  "corepack npm run dev",
  "corepack npm run verify",
  "CONTRIBUTING.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  "SECURITY.md",
  "docs/starter-compatibility.md",
  "docs/getting-started.md",
  "docs/customizing-the-template.md",
  "docs/deployment.md",
  "docs/flagship-demo.md",
  "docs/template-release-preparation.md",
]);
requireText("docs/template-release-preparation.md", [
  "release:prepare",
  "--apply",
  "registry.npmjs.org",
  "Maven Central",
  "excluded from generated applications",
  "adjacent Vireo projection policy",
  "C8C362C561046CD11C0F0DE01174796DD298F009",
  "vireo-release-signing-key.asc",
  "npm@12.0.2 audit signatures",
  "--include-attestations",
  "reconcile=true",
  "Hosted preparation PR",
  "Release · Prepare Template version PR",
  "TEMPLATE_RELEASE_AUTOMATION_APP_ID",
  "TEMPLATE_RELEASE_AUTOMATION_APP_PRIVATE_KEY",
  "TEMPLATE_RELEASE_AUTOMATION_APP_SLUG",
  "repository-scoped App token",
  "It never force-pushes",
  "Release · Reconcile Template preparation PRs",
  "persistent auto-merge",
  "expected-head SHA REST squash-merge",
]);
requireText("docs/flagship.md", [
  "https://github.com/vireocodedev/vireo/issues/new?template=public_beta_feedback.yml",
  "https://github.com/vireocodedev/vireo/issues/new?template=adopter_check_in.yml",
]);
requireText("SUPPORT.md", ["SECURITY.md", "CODE_OF_CONDUCT.md"]);
requireText("SECURITY.md", [templateReleaseTag, templateReleaseContract]);
requireText("SUPPORT.md", [templateReleaseTag, templateReleaseContract]);
requireText("docs/provider-controls-2026-08-31.md", [
  `starter-template@${projectUpgradeContract.previousRelease}`,
  "starter-template@0.8.5",
  templateReleaseTag,
  templateReleaseTagRulesetPath,
  "not evidence that GitHub has applied it",
]);
requireText("SUPPORT.md", [
  "Never move, delete, or recreate an immutable release tag.",
  "pinned `main` workflow-dispatch path",
  "draft or published GitHub release",
  "`template-release` protected GitHub environment",
  "immutable releases are still enabled",
  "wildcard update/non-fast-forward/deletion tag ruleset",
  "active before release mutation",
]);
if (templateReleaseRecovery.schemaVersion !== 1)
  problems.push("template release recovery schemaVersion must equal 1");
if (!/^starter-template@0\.6\.0$/u.test(templateReleaseRecovery.tag ?? ""))
  problems.push(
    "template release recovery must retain the protected immutable 0.6.0 tag",
  );
if (templateReleaseArtifacts.schemaVersion !== 1 || typeof templateReleaseArtifacts.prepared !== "boolean" || templateReleaseArtifacts.mavenGroup !== canonicalMavenGroup)
  problems.push("template release artifact binding must use schemaVersion 1 with a prepared boolean");
if (templateReleaseArtifacts.prepared === true) {
  const artifactProblems = validatePreparedArtifactBinding(templateReleaseArtifacts, { version: templateReleasePolicy.version });
  if (artifactProblems.length)
    problems.push(`prepared artifact binding must bind exact public coordinates: ${artifactProblems.join("; ")}`);
  const coordinateProblems = validateArtifactCoordinateBinding(templateReleaseArtifacts, {
    policy: templateReleasePolicy,
    readFile: (path) => readFileSync(join(root, path)),
  });
  if (coordinateProblems.length)
    problems.push(`prepared artifact binding must match Template dependency and JVM coordinates: ${coordinateProblems.join("; ")}`);
}
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
  if (
    !Array.isArray(ruleset.bypass_actors) ||
    ruleset.bypass_actors.length !== 0
  )
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

function validateWildcardTemplateReleaseTagRuleset(ruleset) {
  if (ruleset.name !== "Protect starter-template release tags")
    problems.push("wildcard Template tag ruleset must have the canonical name");
  if (ruleset.target !== "tag" || ruleset.enforcement !== "active")
    problems.push("wildcard Template tag ruleset must be an active tag ruleset");
  if (!Array.isArray(ruleset.bypass_actors) || ruleset.bypass_actors.length)
    problems.push("wildcard Template tag ruleset must not grant bypass actors");
  if (
    JSON.stringify(ruleset.conditions?.ref_name?.include) !==
      JSON.stringify(["refs/tags/starter-template@*"]) ||
    JSON.stringify(ruleset.conditions?.ref_name?.exclude) !== JSON.stringify([])
  )
    problems.push("wildcard Template tag ruleset must match only starter-template tags");
  const rules = ruleset.rules?.map((rule) => rule?.type)?.sort();
  if (
    JSON.stringify(rules) !==
    JSON.stringify(["deletion", "non_fast_forward", "update"])
  )
    problems.push(
      "wildcard Template tag ruleset must contain exactly update, non-fast-forward, and deletion rules",
    );
}

validateWildcardTemplateReleaseTagRuleset(templateReleaseTagRuleset);
for (const { tag, ruleset } of retainedTemplateReleaseTagRulesets)
  validateImmutableTagRuleset({
    ruleset,
    tag,
    role:
      tag === templateReleaseRecovery.tag
        ? "historical recovery"
        : "retained historical",
  });
if (templateReleaseEnvironment.wait_timer !== 0)
  problems.push("template release environment wait_timer must equal 0");
if (templateReleaseEnvironment.prevent_self_review !== false)
  problems.push(
    "template release environment prevent_self_review must equal false",
  );
const environmentReviewers = templateReleaseEnvironment.reviewers;
if (!Array.isArray(environmentReviewers) || environmentReviewers.length !== 0)
  problems.push("template release environment must have no recurring reviewers");
if (
  templateReleaseEnvironment.deployment_branch_policy?.protected_branches !==
    false ||
  templateReleaseEnvironment.deployment_branch_policy
    ?.custom_branch_policies !== true ||
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
    JSON.stringify([{ name: "main", type: "branch" }]) ||
  JSON.parse(
    readFileSync(
      join(root, ".github/environments/template-release.live-assertions.json"),
      "utf8",
    ),
  ).can_admins_bypass !== false
)
  problems.push(
    "template release environment must permit exactly main runs without administrator bypass",
  );
requireText("docs/generated-capabilities.md", [
  templateReleaseTag,
  templateReleaseContractUrl,
  `create-vireo@${templateReleasePolicy.createVireoVersion}`,
  "0.8.4-to-0.8.5 solely",
  "non-executable superseded evidence",
  "no public `create-vireo@0.8.5` CLI was",
]);
if (
  projectUpgradeContract.schemaVersion !== 1 ||
  projectUpgradeContract.contractId !== "vireo-template-project-upgrades" ||
  projectUpgradeContract.publicRelease !== templateReleasePolicy.version ||
  projectUpgradeContract.candidateRelease !== undefined ||
  !/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u.test(projectUpgradeContract.previousRelease ?? "") ||
  projectUpgradeContract.publicationState !== "final" ||
  !projectUpgradeContract.supportedEdges?.some(
    (edge) =>
      edge.from === projectUpgradeContract.previousRelease &&
      edge.to === templateReleasePolicy.version &&
      edge.status === "supported",
  )
) {
  problems.push(
    "project upgrade contract must declare the final adjacent upgrade coordinate",
  );
}
if (
  supersededTemplateOnlyRelease !== "0.8.5" ||
  !projectUpgradeContract.supportedEdges?.some(
    (edge) =>
      edge.from === "0.8.4" &&
      edge.to === supersededTemplateOnlyRelease &&
      edge.status === "historical" &&
      edge.note ===
        "Superseded Template-only release evidence: no paired public create-vireo@0.8.5 release existed.",
  )
) {
  problems.push(
    "project upgrade contract must retain the superseded Template-only 0.8.4-to-0.8.5 evidence with its unpaired CLI explanation",
  );
}
for (const edge of [
  { from: "0.2.0", to: "0.3.0" },
  { from: "0.6.0", to: "0.7.0" },
  { from: "0.7.0", to: "0.8.0" },
  { from: "0.8.0", to: "0.8.1" },
  { from: "0.8.1", to: "0.8.2" },
  { from: "0.8.2", to: "0.8.3" },
  { from: "0.8.3", to: "0.8.4" },
  { from: "0.8.4", to: "0.8.6" },
]) {
  if (
    !projectUpgradeContract.supportedEdges?.some(
      (candidate) =>
        candidate.from === edge.from &&
        candidate.to === edge.to &&
        candidate.status === "historical",
    )
  )
    problems.push(
      `project upgrade contract must retain historical ${edge.from}-to-${edge.to} edge`,
    );
}
if (
  projectUpgradeContract.targetTemplateCommit !== undefined ||
  projectUpgradeContract.finalization !== undefined ||
  projectUpgradeContract.lockfileRefreshCommands?.["full-stack"] !==
    "corepack npm install --package-lock-only --prefix frontend" ||
  projectUpgradeContract.lockfileRefreshCommands?.frontend !==
    "corepack npm install --package-lock-only"
) {
  problems.push(
    "final project upgrade contract must derive profile-correct lock refresh commands without a self-referential Template SHA",
  );
}
requireText("docs/project-upgrades.md", [
  "0.6.0-to-0.7.0",
  "0.7.0-to-0.8.0",
  "0.8.0-to-0.8.1",
  "0.8.1-to-0.8.2",
  "0.8.2-to-0.8.3",
  "0.8.3-to-0.8.4",
  "0.8.4-to-0.8.5",
  "no paired",
  "create-vireo@0.8.5",
  "0.8.4-to-0.8.6",
  `${projectUpgradeContract.previousRelease}-to-${templateReleasePolicy.version}`,
  ".vireo/example-manifest.json",
  "transactionally",
  "target Template commit",
  "frontend/tests/e2e/overview.spec.ts",
  "full-stack optional sample",
  "refuses the entire managed upgrade on mismatch or customized bytes",
  "No dependency, JVM, schema, Flyway, or lockfile change",
  "root `AGENTS.md`",
  "existing managed projected consumer-skill guidance",
  "frontend/vitest.storybook.config.ts",
  "frontend/scripts/storybook-config-policy.test.mjs",
  "frontend/package.json#scripts.architecture:check",
  "refuses the entire managed upgrade",
  "Application-authored tests, story selection",
  "deployment remain application-owned",
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
for (const script of [
  "test:storybook",
  "test:storybook:local-starter",
  "storybook",
  "storybook:local-starter",
  "build-storybook",
  "build-storybook:local-starter",
]) {
  if (
    !frontendManifest.scripts?.[script]?.startsWith(
      "STORYBOOK_DISABLE_TELEMETRY=1 ",
    )
  ) {
    problems.push(
      `frontend/package.json ${script} must disable Storybook telemetry before startup`,
    );
  }
}
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
    documentedCommand: "corepack npm run verify",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "./scripts/verify-template.sh silent",
  },
  {
    documentation: "docs/deployment.md",
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
const templateReleaseState = readFileSync(
  join(root, "scripts/template-release-state.mjs"),
  "utf8",
);
for (const fragment of [
  "branches: [main]",
  "workflow_dispatch:",
  "Historical immutable recovery tag (only starter-template@0.6.0)",
  "group: template-release-${{ github.event_name == 'push' && github.sha || inputs.tag",
  "cancel-in-progress: false",
  "name: Set up release planner Node.js without package caching",
  "package-manager-cache: false",
  "name: Detect release-coordinate change",
  "name: Require prepared public artifact binding for a successor",
  "contracts/template-release-policy.json",
  "name: Read live release state and plan",
  "node scripts/template-release-state.mjs",
  "name: Create annotated immutable release tag through GitHub REST",
  "repos/$GITHUB_REPOSITORY/git/tags",
  "repos/$GITHUB_REPOSITORY/git/refs",
  "name: Refuse tag-creation races and resolve release recovery state",
  "name: Validate draft manifest before publication",
  "if: steps.draft-state.outputs.action == 'recover-release'",
  "name: Verify immutable published release and exact manifest",
  'gh release edit "$RELEASE_TAG" --draft=false --latest=false',
  "./scripts/verify-template.sh silent",
  "node scripts/template-release-policy.mjs",
  "node scripts/template-release-recovery-policy.mjs",
  "node scripts/write-template-release-manifest.mjs",
  "gh release create",
  "--verify-tag",
  "name: Dispatch the exact immutable release deployment",
  "name: Produce every automation-era durable tag for fail-closed exact validation",
  "uses: ./.github/workflows/template-release-recover.yml",
  "max-parallel: 1",
  "git fetch --tags --force origin +refs/heads/main:refs/remotes/origin/main",
  "name: Reconcile and verify GitHub latest after immutable publication",
  "name: Independently reconcile and verify GitHub latest",
  "name: Compare the newest eligible immutable release with public deployment proof",
  "name: Dispatch the newest eligible immutable release when proof differs or is unavailable",
  "node scripts/template-release-reconciliation.mjs assert-automation-tag",
  "needs.recover-durable-tags.result == 'success'",
  "node scripts/template-release-reconciliation.mjs",
  "actions: write",
  "gh workflow run flagship-demo.yml",
]) {
  if (!templateReleaseWorkflow.includes(fragment))
    problems.push(
      `template release workflow must contain ${JSON.stringify(fragment)}`,
    );
}
if (/node scripts\/template-release-state\.mjs[^\n]*\|\s*tee/u.test(templateReleaseWorkflow))
  problems.push(
    "template release workflow must not mask planner failures with a tee pipeline",
  );
if (templateReleaseWorkflow.includes("reconcile_tag") || templateReleaseWorkflow.includes("  reconcile-durable-tag:"))
  problems.push(
    "template release workflow must use the reusable exact-tag recovery path rather than a duplicated inline recovery job",
  );
if (
  !templateReleaseState.includes("ruleset?.bypass_actors !== undefined") ||
  !templateReleaseState.includes("ruleset.bypass_actors.length !== 0")
)
  problems.push(
    "template release state must accept an unobservable bypass field but reject a visible nonempty bypass list",
  );
const releaseSetup = "corepack npm run setup";
const releaseVerification = templateReleaseWorkflow.indexOf(
  "name: Verify exact release target before mutation",
);
const releaseManifest = templateReleaseWorkflow.indexOf(
  "name: Write exact release manifest",
);
const tagCreation = templateReleaseWorkflow.indexOf(
  "name: Create annotated immutable release tag through GitHub REST",
);
const releaseCreation = templateReleaseWorkflow.indexOf(
  "name: Create draft release and attach manifest",
);
if (!(releaseVerification >= 0 && releaseVerification < releaseManifest && releaseManifest < tagCreation && tagCreation < releaseCreation)) {
  problems.push(
    "template release workflow must verify the exact release target before tag or release mutation",
  );
}

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

const reusableTemplateRecoveryWorkflow = readFileSync(
  join(root, ".github/workflows/template-release-recover.yml"),
  "utf8",
);
if (
  reusableTemplateRecoveryWorkflow.includes("workflow_dispatch:") ||
  reusableTemplateRecoveryWorkflow.includes("actions: write")
) {
  problems.push(
    "the reusable durable recovery workflow must be parent-only and retain contents-only release permissions",
  );
}
const verifyTemplateWorkflowLines = [
  ...templateReleaseWorkflow.split("\n"),
  ...reusableTemplateRecoveryWorkflow.split("\n"),
].filter((line) => line.includes("./scripts/verify-template.sh silent"));
if (
  verifyTemplateWorkflowLines.length !== 3 ||
  verifyTemplateWorkflowLines.some(
    (line) =>
      line.trim() !==
      'run: env GITHUB_SHA="$RELEASE_COMMIT" ./scripts/verify-template.sh silent',
  )
)
  problems.push(
    "Template publication and both bounded recovery workflows must invoke verify-template with the resolved release commit as GITHUB_SHA",
  );

const releaseIdentityCommands = templateReleaseWorkflow
  .split("\n")
  .filter((line) =>
    /(?:write-template-release-manifest\.mjs|gh release (?:create|edit)|git\/tags|git\/refs)/u.test(
      line,
    ),
  );
for (const unsafeIdentity of releaseIdentityCommands) {
  if (
    /(?:GITHUB_(?:SHA|REF_NAME)|github\.(?:sha|ref_name))/u.test(unsafeIdentity)
  )
    problems.push(
      `template release workflow must not use unverified GitHub identity ${JSON.stringify(unsafeIdentity)}`,
    );
}

const templatePreparationWorkflow = readFileSync(
  join(root, ".github/workflows/template-release-preparation.yml"),
  "utf8",
);
for (const fragment of [
  "name: Release · Prepare Template version PR",
  "workflow_dispatch:",
  "release_version:",
  "jvm_version:",
  "npm_versions:",
  "permissions: {}",
  "group: template-release-preparation-${{ inputs.release_version }}",
  "cancel-in-progress: false",
  "ref: main",
  "git checkout --detach \"$main_commit\"",
  "corepack npm run release:prepare --",
  "--npm-json \"$NPM_VERSIONS\"",
  "assert-generated-paths",
  "assert-working-tree",
  "Run complete Template qualification before credentials",
  "Verify production PWA lifecycle before credentials",
  "Enforce Lighthouse production budgets before credentials",
  "Verify production-like deployment before credentials",
  "environment: template-preparation",
  "Mint repository-scoped GitHub App token after qualification",
  "actions/create-github-app-token@bcd2ba49218906704ab6c1aa796996da409d3eb1",
  "app-id: ${{ vars.TEMPLATE_RELEASE_AUTOMATION_APP_ID }}",
  "private-key: ${{ secrets.TEMPLATE_RELEASE_AUTOMATION_APP_PRIVATE_KEY }}",
  "repositories: ${{ github.event.repository.name }}",
  "permission-contents: write",
  "permission-pull-requests: write",
  "git apply --index",
  "gh auth setup-git",
  "git push \"$remote\" \"HEAD:refs/heads/$branch\"",
  "assert-existing-pr",
]) {
  if (!templatePreparationWorkflow.includes(fragment))
    problems.push(`template preparation workflow must contain ${JSON.stringify(fragment)}`);
}
if (templatePreparationWorkflow.includes("GITHUB_TOKEN") || templatePreparationWorkflow.includes("gh pr merge") || templatePreparationWorkflow.includes("--force"))
  problems.push("template preparation workflow must not use GITHUB_TOKEN for writes, auto-merge, or force-push");
const completeQualification = templatePreparationWorkflow.indexOf("Run complete Template qualification before credentials");
const appTokenMint = templatePreparationWorkflow.indexOf("Mint repository-scoped GitHub App token after qualification");
if (!(completeQualification >= 0 && completeQualification < appTokenMint))
  problems.push("template preparation workflow must mint its App token only after complete qualification");
if (templatePreparationWorkflow.includes("git add --all"))
  problems.push("template preparation workflow must validate all generated and untracked paths before any staging");
if ((templatePreparationWorkflow.match(/git rev-parse origin\/main/g) ?? []).length < 2)
  problems.push("template preparation workflow must reject a moved main both before credentials and immediately before PR mutation");

const templatePreparationReconciler = readFileSync(
  join(root, ".github/workflows/template-release-preparation-reconcile.yml"),
  "utf8",
);
for (const fragment of [
  "name: Release · Reconcile Template preparation PRs",
  "schedule:",
  "workflow_dispatch:",
  "permissions: {}",
  "group: template-release-preparation-reconciler",
  "environment: template-preparation",
  "Read-only inspect every marked automation preparation PR",
  "candidate-numbers",
  "inspect-local",
  "Mint repository-scoped GitHub App token after read-only eligibility",
  "Immediately revalidate and squash merge the expected head",
  "Perform one expected-head App-token squash merge",
  "actions/create-github-app-token@bcd2ba49218906704ab6c1aa796996da409d3eb1",
  "ACTUAL_APP_SLUG: ${{ steps.app-token.outputs.app-slug }}",
  "EXPECTED_APP_SLUG: ${{ vars.TEMPLATE_RELEASE_AUTOMATION_APP_SLUG }}",
  "--app-slug \"$ACTUAL_APP_SLUG\"",
  "--expected-tree \"$EXPECTED_TREE\"",
  "corepack npm run release:prepare --",
  "git worktree add --detach",
  "git write-tree",
  "permission-contents: write",
  "permission-pull-requests: write",
  "gh api --method PUT \"repos/$GITHUB_REPOSITORY/pulls/$NUMBER/merge\"",
  'merge_method: "squash"',
  'require(process.argv[1]).merged !== true',
  "git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main",
]) {
  if (!templatePreparationReconciler.includes(fragment))
    problems.push(`template preparation reconciler must contain ${JSON.stringify(fragment)}`);
}
if (templatePreparationReconciler.includes("gh pr merge") || templatePreparationReconciler.includes("auto-merge") || templatePreparationReconciler.includes("--force"))
  problems.push("template preparation reconciler must use only a one-shot expected-head REST squash merge");
const readOnlyInspection = templatePreparationReconciler.indexOf("Read-only inspect every marked automation preparation PR");
const reconcilerAppTokenMint = templatePreparationReconciler.indexOf("Mint repository-scoped GitHub App token after read-only eligibility");
const immediateRevalidation = templatePreparationReconciler.indexOf("Immediately revalidate and squash merge the expected head");
const expectedHeadMerge = templatePreparationReconciler.indexOf("Perform one expected-head App-token squash merge");
if (!(readOnlyInspection >= 0 && readOnlyInspection < reconcilerAppTokenMint && reconcilerAppTokenMint < immediateRevalidation && immediateRevalidation < expectedHeadMerge))
  problems.push("template preparation reconciler must inspect before token minting and revalidate immediately afterward");
const reconcilerInspectionJob = templatePreparationReconciler.slice(
  templatePreparationReconciler.indexOf("  inspect:"),
  templatePreparationReconciler.indexOf("  revalidate-and-merge:"),
);
const reconcilerMutationJob = templatePreparationReconciler.slice(
  templatePreparationReconciler.indexOf("  revalidate-and-merge:"),
);
if (reconcilerInspectionJob.includes("environment: template-preparation") || reconcilerInspectionJob.includes("TEMPLATE_RELEASE_AUTOMATION_APP_ID") || reconcilerInspectionJob.includes("TEMPLATE_RELEASE_AUTOMATION_APP_PRIVATE_KEY") || !reconcilerInspectionJob.includes("pull-requests: read") || !reconcilerInspectionJob.includes("checks: read") || !reconcilerInspectionJob.includes("EXPECTED_APP_SLUG: ${{ vars.TEMPLATE_RELEASE_AUTOMATION_APP_SLUG }}") || !reconcilerInspectionJob.includes("reconciliation is a successful no-op until the dedicated App is configured") || !reconcilerInspectionJob.includes("TEMPLATE_RELEASE_AUTOMATION_APP_SLUG must be a GitHub App slug") || !reconcilerInspectionJob.includes("--app-slug \"$EXPECTED_APP_SLUG\"") || !reconcilerInspectionJob.includes("git worktree add --detach") || !reconcilerInspectionJob.includes("corepack npm run release:prepare --") || !reconcilerInspectionJob.includes("git write-tree"))
  problems.push("template preparation read-only inspection must run outside the protected environment, verify the public App slug, and independently regenerate an expected tree before mutation");
if (!reconcilerMutationJob.includes("needs: inspect") || !reconcilerMutationJob.includes("if: needs.inspect.outputs.merge == 'true'") || !reconcilerMutationJob.includes("environment: template-preparation") || !reconcilerMutationJob.includes("pull-requests: read") || !reconcilerMutationJob.includes("checks: read"))
  problems.push("template preparation App mutation must be a protected job reachable only from an eligible read-only inspection");
const revalidationStep = reconcilerMutationJob.slice(
  reconcilerMutationJob.indexOf("Immediately revalidate and squash merge the expected head"),
  reconcilerMutationJob.indexOf("Perform one expected-head App-token squash merge"),
);
const mergeStep = reconcilerMutationJob.slice(
  reconcilerMutationJob.indexOf("Perform one expected-head App-token squash merge"),
);
if (!revalidationStep.includes("GH_TOKEN: ${{ github.token }}") || revalidationStep.includes("GH_TOKEN: ${{ steps.app-token.outputs.token }}") || !revalidationStep.includes("EXPECTED_TREE: ${{ needs.inspect.outputs.expected_tree }}") || !revalidationStep.includes("test \"$ACTUAL_APP_SLUG\" = \"$EXPECTED_APP_SLUG\"") || !revalidationStep.includes("--expected-tree \"$EXPECTED_TREE\"") || !mergeStep.includes("GH_TOKEN: ${{ steps.app-token.outputs.token }}") || !mergeStep.includes("EXPECTED_HEAD: ${{ steps.revalidate.outputs.head }}") || !mergeStep.includes("EXPECTED_MAIN: ${{ steps.revalidate.outputs.main }}"))
  problems.push("template preparation reconciler must use github.token only for final reads and reserve the App token for the expected-head merge");

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
  if (/(?<!corepack )npm run\b/u.test(markdown)) {
    problems.push(
      `${relative(root, source)} must route documented npm scripts through Corepack`,
    );
  }
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

for (const path of [
  "scripts/setup.mjs",
  "scripts/dev.mjs",
  "scripts/vireo-doctor.mjs",
  "scripts/verification-host.mjs",
]) {
  if (/(?<!corepack )npm run\b/u.test(readFileSync(join(root, path), "utf8"))) {
    problems.push(
      `${path} must route user-facing npm script remedies through Corepack`,
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
