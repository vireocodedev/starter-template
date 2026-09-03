import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  requiredArtifactFiles,
  validateArtifactCoordinateBinding,
  validateArtifactFileDigests,
  validatePreparedArtifactBinding,
} from "./template-release-artifacts.mjs";
import { validateTemplateReleaseCoordinates } from "./template-release-policy.mjs";
import {
  assertGeneratedReleasePaths,
  createPreparationPullRequest,
  parseTemplatePreparationWorkflowInput,
} from "./template-release-preparation-workflow.mjs";

const candidateBranch = /^automation\/template-release-0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const marker = /^<!-- vireo-template-release-preparation-v1 base=[0-9a-f]{40} tree=[0-9a-f]{40} input=[0-9a-f]{64} -->$/u;

function git(args, options = {}) {
  return execFileSync("git", args, { encoding: "utf8", ...options }).trim();
}

function gitBytes(args, options = {}) {
  return Buffer.from(execFileSync("git", args, options));
}

function nulPaths(bytes) {
  return bytes.toString("utf8").split("\0").filter(Boolean);
}

function checkSha(value, label) {
  if (!/^[0-9a-f]{40}$/u.test(value ?? "")) throw new Error(`${label} must be a lowercase 40-hex SHA`);
  return value;
}

export function isTemplatePreparationCandidate(pullRequest) {
  return pullRequest?.state === "OPEN" &&
    candidateBranch.test(pullRequest.headRefName ?? "") &&
    marker.test(String(pullRequest.body ?? "").split("\n", 1)[0]);
}

export function requiredChecksFromRuleset(ruleset) {
  const checks = ruleset?.rules?.find((rule) => rule?.type === "required_status_checks")?.parameters?.required_status_checks;
  if (!Array.isArray(checks) || !checks.length) throw new Error("main ruleset must declare required status checks");
  const normalized = checks.map((check) => ({ context: check?.context, integrationId: check?.integration_id }));
  if (normalized.some((check) => typeof check.context !== "string" || !Number.isInteger(check.integrationId)) || new Set(normalized.map((check) => `${check.context}:${check.integrationId}`)).size !== normalized.length)
    throw new Error("main ruleset required checks must have unique exact context and integration IDs");
  return normalized;
}

export function reconstructTemplatePreparationInput({ policy, artifact }) {
  const problems = [
    ...validateTemplateReleaseCoordinates(policy),
    ...validatePreparedArtifactBinding(artifact, { version: policy?.version }),
  ];
  const jvmVersion = policy?.ecosystemRelease?.match(/_jvm-(0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/u)?.[1];
  if (!jvmVersion || artifact?.maven?.version !== jvmVersion)
    problems.push("prepared artifact binding JVM version must match the release policy");
  if (problems.length) throw new Error(problems.join("; "));
  return parseTemplatePreparationWorkflowInput({
    release_version: policy.version,
    jvm_version: jvmVersion,
    npm_versions: JSON.stringify(Object.fromEntries(Object.entries(artifact.npm).map(([name, evidence]) => [name, evidence?.version]))),
  });
}

function checkExactRunStatus(checkRuns, requiredChecks) {
  const pending = [];
  for (const required of requiredChecks) {
    const matches = (checkRuns ?? []).filter((run) => run?.name === required.context && Number(run?.app?.id) === required.integrationId);
    if (matches.length !== 1) {
      pending.push(`required check ${required.context}:${required.integrationId} is missing or ambiguous`);
      continue;
    }
    if (matches[0].status !== "completed" || matches[0].conclusion !== "success")
      pending.push(`required check ${required.context}:${required.integrationId} is not successful`);
  }
  return pending;
}

function pullRequestCommit(pullRequest) {
  if (pullRequest?.commits?.totalCount !== 1 || pullRequest.commits.nodes?.length !== 1)
    return { error: "preparation PR must contain exactly one commit" };
  return { commit: pullRequest.commits.nodes[0]?.commit };
}

export function candidateDiffBase(pullRequest, fallbackMainCommit) {
  const parent = pullRequest?.commits?.nodes?.[0]?.commit?.parents?.nodes?.[0]?.oid;
  // Keep malformed parent data evaluable as tampering instead of crashing the
  // read-only workflow. For a well-formed candidate, compare its own single
  // commit to its parent: comparing current main to a stale head would include
  // unrelated newer-main changes and falsely classify an ordinary stale PR.
  return /^[0-9a-f]{40}$/u.test(parent ?? "") ? parent : fallbackMainCommit;
}

export function evaluateTemplatePreparationPullRequest({ observation, appSlug, requiredChecks, expectedTree }) {
  const pullRequest = observation?.pullRequest;
  const tampering = [];
  const waiting = [];
  if (!isTemplatePreparationCandidate(pullRequest)) return { action: "ignore" };
  if (appSlug !== undefined && !/^[a-z0-9][a-z0-9-]*$/u.test(appSlug))
    throw new Error("configured GitHub App slug must be lowercase letters, digits, and hyphens");
  const expectedApp = appSlug && `${appSlug}[bot]`;
  const { commit, error } = pullRequestCommit(pullRequest);
  if (error) tampering.push(error);
  if (expectedApp && pullRequest.author?.login !== expectedApp) tampering.push("preparation PR author must be the configured GitHub App bot");
  if (commit?.oid !== pullRequest.headRefOid) tampering.push("preparation PR commit must equal its head SHA");
  if (expectedApp && (commit?.author?.user?.login !== expectedApp || commit?.committer?.user?.login !== expectedApp))
    tampering.push("preparation PR commit author and committer must be the configured GitHub App bot");
  const parent = commit?.parents?.nodes?.[0]?.oid;
  if (commit?.parents?.totalCount !== 1 || !/^[0-9a-f]{40}$/u.test(parent ?? ""))
    tampering.push("preparation PR must have exactly one well-formed parent");
  const hasCurrentMainParent = parent === observation.mainCommit;
  if (!tampering.length && !hasCurrentMainParent)
    waiting.push("preparation PR base is stale because main moved");
  if (pullRequest.baseRefName !== "main") tampering.push("preparation PR base must be main");
  if (pullRequest.isDraft) waiting.push("preparation PR is still a draft");
  if (pullRequest.mergeStateStatus !== "CLEAN") waiting.push(`preparation PR merge state is ${pullRequest.mergeStateStatus ?? "unknown"}`);
  if (pullRequest.reviewThreads?.pageInfo?.hasNextPage || pullRequest.reviewThreads?.totalCount !== pullRequest.reviewThreads?.nodes?.length)
    waiting.push("all review threads could not be inspected");
  else if (pullRequest.reviewThreads?.nodes?.some((thread) => thread?.isResolved !== true))
    waiting.push("preparation PR has unresolved review threads");
  if (observation.checks?.total_count > 100) waiting.push("required check set exceeds the bounded inspection page");
  else waiting.push(...checkExactRunStatus(observation.checks?.check_runs, requiredChecks));

  let input;
  let expected;
  try {
    input = reconstructTemplatePreparationInput({ policy: observation.policy, artifact: observation.artifact });
    if (expectedTree !== undefined) checkSha(expectedTree, "independently regenerated release tree");
    const observedTree = checkSha(commit?.tree?.oid, "preparation commit tree");
    // A stale candidate is not hostile by itself.  Reconstruct its immutable
    // marker from its actual parent so ordinary main movement remains a no-op;
    // expectedTree is only meaningful when that parent is current main.
    expected = createPreparationPullRequest({
      input,
      baseCommit: hasCurrentMainParent ? observation.mainCommit : parent,
      tree: hasCurrentMainParent && expectedTree !== undefined ? expectedTree : observedTree,
    });
  } catch (failure) {
    tampering.push(`cannot reconstruct canonical preparation input: ${failure.message}`);
  }
  const fileProblems = [
    ...validateArtifactFileDigests(observation.artifact, { readFile: (path) => observation.files?.[path] }),
    ...validateArtifactCoordinateBinding(observation.artifact, { policy: observation.policy, readFile: (path) => observation.files?.[path] }),
  ];
  if (fileProblems.length) tampering.push(`artifact binding does not match the PR head: ${fileProblems.join("; ")}`);
  try { assertGeneratedReleasePaths(observation.changedPaths ?? []); }
  catch (failure) { tampering.push(failure.message); }
  if (expected) {
    if (pullRequest.headRefName !== expected.branch) tampering.push("preparation PR branch does not match canonical release input");
    if (pullRequest.title !== expected.title || pullRequest.body !== expected.body) tampering.push("preparation PR title or body does not exactly match its canonical marker");
    if (commit?.messageHeadline !== expected.title || commit?.messageBody !== expected.marker)
      tampering.push("preparation commit message does not exactly match its canonical title and marker");
    if (hasCurrentMainParent && expectedTree !== undefined && commit?.tree?.oid !== expectedTree)
      tampering.push("preparation commit tree does not match the independently regenerated release tree");
  }
  if (tampering.length) return { action: "tampered", reasons: tampering };
  if (waiting.length) return { action: "wait", reasons: waiting };
  if (expectedTree === undefined) return { action: "qualify", number: pullRequest.number, head: pullRequest.headRefOid, input };
  return {
    action: "merge",
    number: pullRequest.number,
    head: pullRequest.headRefOid,
    title: pullRequest.title,
    input,
    expectedTree,
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function localObservation({ mainCommit, pullRequest, checks }) {
  checkSha(mainCommit, "main commit");
  const head = checkSha(pullRequest?.headRefOid, "pull request head");
  const files = Object.fromEntries(requiredArtifactFiles.map((path) => [path, Buffer.from(execFileSync("git", ["show", `${head}:${path}`]))]));
  return {
    mainCommit,
    pullRequest,
    checks,
    policy: JSON.parse(Buffer.from(execFileSync("git", ["show", `${head}:contracts/template-release-policy.json`])).toString("utf8")),
    artifact: JSON.parse(Buffer.from(execFileSync("git", ["show", `${head}:contracts/template-release-artifacts.json`])).toString("utf8")),
    files,
    changedPaths: nulPaths(gitBytes(["diff", "--name-only", "-z", "--no-renames", candidateDiffBase(pullRequest, mainCommit), head])),
  };
}

function readOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`unexpected reconciler argument: ${key}`);
    const value = argv[++index];
    if (value === undefined) throw new Error(`${key} requires a value`);
    const normalized = key.slice(2).replaceAll("-", "_");
    if (options[normalized] !== undefined) throw new Error(`${key} must be specified exactly once`);
    options[normalized] = value;
  }
  return options;
}

function main() {
  const [command, ...argv] = process.argv.slice(2);
  const options = readOptions(argv);
  if (command === "candidate-numbers") {
    const candidates = readJson(options.pull_requests).filter(isTemplatePreparationCandidate).map((pullRequest) => pullRequest.number).sort((left, right) => left - right);
    process.stdout.write(`${JSON.stringify(candidates)}\n`);
    return;
  }
  if (command === "inspect-local") {
    const raw = readJson(options.pull_request);
    const pullRequest = raw?.data?.repository?.pullRequest ?? raw;
    const decision = evaluateTemplatePreparationPullRequest({
      observation: localObservation({ mainCommit: options.main_commit, pullRequest, checks: readJson(options.checks) }),
      appSlug: options.app_slug,
      expectedTree: options.expected_tree,
      requiredChecks: requiredChecksFromRuleset(readJson(options.ruleset)),
    });
    process.stdout.write(`${JSON.stringify(decision)}\n`);
    return;
  }
  throw new Error("usage: template-release-preparation-reconciler.mjs candidate-numbers --pull-requests FILE | inspect-local --main-commit SHA --pull-request FILE --checks FILE --ruleset FILE [--app-slug SLUG] [--expected-tree SHA]");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
