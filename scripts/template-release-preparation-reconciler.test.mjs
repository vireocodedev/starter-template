import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { artifactMavenModules, artifactNpmPackages, canonicalMavenGroup, createPreparedArtifactBinding, requiredArtifactFiles } from "./template-release-artifacts.mjs";
import { releasePreparationGeneratedPaths } from "./template-release-prepare.mjs";
import { createPreparationPullRequest, parseTemplatePreparationWorkflowInput } from "./template-release-preparation-workflow.mjs";
import { candidateDiffBase, evaluateTemplatePreparationPullRequest } from "./template-release-preparation-reconciler.mjs";

const appSlug = "vireo-template-release-automation";
const mainCommit = "a".repeat(40);
const head = "c".repeat(40);
const tree = "b".repeat(40);
const requiredChecks = [
  { context: "verify", integrationId: 15368 },
  { context: "analyze", integrationId: 15368 },
  { context: "CodeQL", integrationId: 57789 },
  { context: "dependency-review", integrationId: 15368 },
  { context: "Secret history scan", integrationId: 15368 },
];
const digest = (value) => createHash("sha256").update(value).digest("hex");

function fixture() {
  const npmVersions = Object.fromEntries(artifactNpmPackages.map((name, index) => [name, index === 5 ? "0.2.4" : name.endsWith("ui") ? "0.3.2" : "0.2.3"]));
  const input = parseTemplatePreparationWorkflowInput({ release_version: "0.8.8", jvm_version: "0.3.2", npm_versions: JSON.stringify(npmVersions) });
  const policy = {
    schemaVersion: 1,
    version: input.templateVersion,
    tag: `starter-template@${input.templateVersion}`,
    createVireoVersion: input.createVireoVersion,
    ecosystemRelease: `npm-${input.createVireoVersion}_jvm-${input.jvmVersion}`,
    repository: "vireocodedev/vireo-template",
    releaseUrl: `https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%40${input.templateVersion}`,
    immutableReleasesRequired: true,
  };
  const npm = Object.fromEntries(Object.entries(npmVersions).map(([name, version]) => [name, {
    version,
    tarball: `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${version}.tgz`,
    integrity: `sha512-${name}`,
    attestation: "https://registry.npmjs.org/-/npm/v1/attestations/test",
    attestationBundleSha256: "d".repeat(64),
  }]));
  const files = {
    "contracts/template-release-policy.json": JSON.stringify(policy),
    ".vireo/template.json": JSON.stringify({ schemaVersion: 1, profile: "full-stack", template: policy.repository, version: policy.version, tag: policy.tag, createVireoVersion: policy.createVireoVersion, ecosystemRelease: policy.ecosystemRelease }),
    "package.json": JSON.stringify({ name: "starter-template", private: true, version: policy.version, scripts: { vireo: `npx --yes --package=create-vireo@${policy.version} vireo` } }),
    "frontend/package.json": JSON.stringify({ dependencies: Object.fromEntries(Object.entries(npmVersions).map(([name, version]) => [name, `^${version}`])) }),
    "frontend/package-lock.json": JSON.stringify({ packages: Object.fromEntries(Object.entries(npm).map(([name, evidence]) => [`node_modules/${name}`, { version: evidence.version, integrity: evidence.integrity }])) }),
    "gradle.properties": "starterVersion=0.3.2\n",
    "contracts/vireo-package-compatibility.json": JSON.stringify({ packages: Object.fromEntries(Object.entries(npmVersions).map(([name, version]) => [name, [`^${version}`]])) }),
    "contracts/project-upgrade-policy.json": "{}",
  };
  assert.deepEqual(Object.keys(files).sort(), [...requiredArtifactFiles].sort());
  const artifact = createPreparedArtifactBinding({
    templateVersion: policy.version,
    createVireoVersion: policy.createVireoVersion,
    npm,
    maven: { group: canonicalMavenGroup, version: "0.3.2", modules: Object.fromEntries(artifactMavenModules.map((name) => [name, { sha256: "e".repeat(64), signatureSha256: "f".repeat(64) }])) },
    files: Object.fromEntries(Object.entries(files).map(([path, value]) => [path, digest(value)])),
  });
  const expected = createPreparationPullRequest({ input, baseCommit: mainCommit, tree });
  return {
    pullRequest: {
      number: 41,
      state: "OPEN",
      isDraft: false,
      mergeStateStatus: "CLEAN",
      headRefName: expected.branch,
      headRefOid: head,
      baseRefName: "main",
      author: { login: `${appSlug}[bot]` },
      title: expected.title,
      body: expected.body,
      reviewThreads: { totalCount: 0, pageInfo: { hasNextPage: false }, nodes: [] },
      commits: {
        totalCount: 1,
        nodes: [{ commit: {
          oid: head,
          tree: { oid: tree },
          parents: { totalCount: 1, nodes: [{ oid: mainCommit }] },
          author: { user: { login: `${appSlug}[bot]` } },
          committer: { user: { login: `${appSlug}[bot]` } },
          messageHeadline: expected.title,
          messageBody: expected.marker,
        } }],
      },
    },
    mainCommit,
    policy,
    artifact,
    files,
    changedPaths: [...releasePreparationGeneratedPaths],
    checks: { total_count: requiredChecks.length, check_runs: requiredChecks.map((check) => ({ name: check.context, app: { id: check.integrationId }, status: "completed", conclusion: "success" })) },
  };
}

function evaluate(observation = fixture()) {
  return evaluateTemplatePreparationPullRequest({ observation, appSlug, requiredChecks, expectedTree: tree });
}

test("selects only an exact fully-qualified App-authored preparation PR", () => {
  const result = evaluate();
  assert.equal(result.action, "merge");
  assert.equal(result.number, 41);
  assert.equal(result.head, head);
});

test("waits for pending checks and unresolved threads without merging", () => {
  const pending = fixture();
  pending.checks.check_runs[0].status = "queued";
  assert.equal(evaluate(pending).action, "wait");
  const unresolved = fixture();
  unresolved.pullRequest.reviewThreads = { totalCount: 1, pageInfo: { hasNextPage: false }, nodes: [{ isResolved: false }] };
  assert.equal(evaluate(unresolved).action, "wait");
});

test("unprotected inspection rejects a candidate whose identity is not the configured GitHub App", () => {
  const observation = fixture();
  observation.pullRequest.author.login = "unverified";
  observation.pullRequest.commits.nodes[0].commit.author.user.login = "unverified";
  observation.pullRequest.commits.nodes[0].commit.committer.user.login = "unverified";
  assert.equal(evaluate(observation).action, "tampered");
});

test("leaves an otherwise exact candidate alone when main has moved", () => {
  const observation = fixture();
  const candidateParent = observation.mainCommit;
  observation.mainCommit = "d".repeat(40);
  // A newer main can contain arbitrary unrelated changes; local inspection must
  // diff the candidate's parent to its head, not current main to its head.
  assert.equal(candidateDiffBase(observation.pullRequest, observation.mainCommit), candidateParent);
  assert.equal(evaluate(observation).action, "wait");
});

test("rejects a self-consistent marker and bot metadata when an allowed path changes the tree", () => {
  const observation = fixture();
  const alteredTree = "d".repeat(40);
  const input = parseTemplatePreparationWorkflowInput({
    release_version: observation.policy.version,
    jvm_version: observation.artifact.maven.version,
    npm_versions: JSON.stringify(Object.fromEntries(Object.entries(observation.artifact.npm).map(([name, evidence]) => [name, evidence.version]))),
  });
  const spoofed = createPreparationPullRequest({ input, baseCommit: mainCommit, tree: alteredTree });
  const commit = observation.pullRequest.commits.nodes[0].commit;
  commit.tree.oid = alteredTree;
  commit.messageHeadline = spoofed.title;
  commit.messageBody = spoofed.marker;
  observation.pullRequest.title = spoofed.title;
  observation.pullRequest.body = spoofed.body;
  observation.pullRequest.headRefName = spoofed.branch;
  assert.equal(evaluateTemplatePreparationPullRequest({ observation, appSlug, requiredChecks, expectedTree: tree }).action, "tampered");
});

test("fails closed for wrong App identity, base/head/tree/body, or multiple commits", () => {
  const variants = [
    (value) => { value.pullRequest.author.login = "attacker"; },
    (value) => { value.pullRequest.commits.nodes[0].commit.author.user.login = "attacker"; },
    (value) => { value.pullRequest.headRefOid = "d".repeat(40); },
    (value) => { value.pullRequest.baseRefName = "release"; },
    (value) => { value.pullRequest.commits.nodes[0].commit.tree.oid = "d".repeat(40); },
    (value) => { value.pullRequest.body = `${value.pullRequest.body}\nmodified`; },
    (value) => { value.pullRequest.commits.totalCount = 2; },
    (value) => { value.pullRequest.commits.nodes[0].commit.parents.nodes[0].oid = "d".repeat(40); },
  ];
  for (const mutate of variants) {
    const observation = fixture();
    mutate(observation);
    assert.equal(evaluate(observation).action, "tampered");
  }
});

test("uses github.token for protected revalidation and reserves the App token for the merge", () => {
  const workflow = readFileSync(join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), ".github/workflows/template-release-preparation-reconcile.yml"), "utf8");
  const revalidation = workflow.slice(workflow.indexOf("Immediately revalidate and squash merge the expected head"), workflow.indexOf("Perform one expected-head App-token squash merge"));
  const merge = workflow.slice(workflow.indexOf("Perform one expected-head App-token squash merge"));
  const inspection = workflow.slice(workflow.indexOf("  inspect:"), workflow.indexOf("  revalidate-and-merge:"));
  assert.match(inspection, /EXPECTED_APP_SLUG: \$\{\{ vars\.TEMPLATE_RELEASE_AUTOMATION_APP_SLUG \}\}/u);
  assert.match(inspection, /reconciliation is a successful no-op until the dedicated App is configured/u);
  assert.match(inspection, /TEMPLATE_RELEASE_AUTOMATION_APP_SLUG must be a GitHub App slug/u);
  assert.match(inspection, /--app-slug "\$EXPECTED_APP_SLUG"/u);
  assert.match(revalidation, /GH_TOKEN: \$\{\{ github\.token \}\}/u);
  assert.doesNotMatch(revalidation, /GH_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/u);
  assert.match(revalidation, /test "\$ACTUAL_APP_SLUG" = "\$EXPECTED_APP_SLUG"/u);
  assert.match(revalidation, /EXPECTED_TREE: \$\{\{ needs\.inspect\.outputs\.expected_tree \}\}/u);
  assert.match(revalidation, /--expected-tree "\$EXPECTED_TREE"/u);
  assert.match(merge, /GH_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/u);
  assert.match(merge, /EXPECTED_HEAD: \$\{\{ steps\.revalidate\.outputs\.head \}\}/u);
  assert.match(merge, /merged !== true/u);
});
