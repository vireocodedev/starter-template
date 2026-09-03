import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateTemplateReleaseCoordinates } from "./template-release-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rulesetName = "Protect starter-template release tags";
const manifestName = "template-release-manifest.json";

export function validateWildcardTagRuleset(ruleset) {
  const expected = {
    name: rulesetName,
    target: "tag",
    enforcement: "active",
    include: ["refs/tags/starter-template@*"],
    exclude: [],
    rules: ["deletion", "non_fast_forward", "update"],
  };
  const actualRules = ruleset?.rules?.map((rule) => rule?.type)?.sort();
  if (
    ruleset?.name !== expected.name ||
    ruleset?.target !== expected.target ||
    ruleset?.enforcement !== expected.enforcement ||
    !Array.isArray(ruleset?.bypass_actors) ||
    ruleset.bypass_actors.length !== 0 ||
    JSON.stringify(ruleset?.conditions?.ref_name?.include) !==
      JSON.stringify(expected.include) ||
    JSON.stringify(ruleset?.conditions?.ref_name?.exclude) !==
      JSON.stringify(expected.exclude) ||
    JSON.stringify(actualRules) !== JSON.stringify(expected.rules)
  ) {
    return "live wildcard starter-template tag ruleset does not exactly match the checked-in desired state";
  }
  return undefined;
}

export function validateReleaseManifest({ manifest, policy, commit }) {
  if (!manifest || typeof manifest !== "object")
    return "release manifest is missing or invalid";
  if (manifest.schemaVersion !== 1)
    return "release manifest schemaVersion must equal 1";
  for (const [key, value] of Object.entries(policy)) {
    if (manifest[key] !== value)
      return `release manifest ${key} must match the current release policy`;
  }
  if (manifest.commit !== commit)
    return "release manifest commit must equal the annotated tag commit";
  return undefined;
}

function tagStatus({ tag, policy }) {
  if (tag?.status === "absent") return { kind: "absent" };
  if (
    tag?.status !== "present" ||
    tag.name !== policy.tag ||
    tag.annotated !== true ||
    !/^[0-9a-f]{40}$/u.test(tag.commit ?? "") ||
    tag.ancestor !== true
  ) {
    return { kind: "inconsistent", reason: "tag identity is not an annotated ancestor of main" };
  }
  return { kind: "exact", commit: tag.commit };
}

function releaseStatus({ release, policy, commit }) {
  if (release?.status === "absent") return { kind: "absent" };
  if (release?.status !== "present" || release.tag !== policy.tag)
    return { kind: "inconsistent", reason: "release identity does not match the release policy" };
  const manifestProblem = validateReleaseManifest({
    manifest: release.manifest,
    policy,
    commit,
  });
  if (release.draft === true) {
    return manifestProblem
      ? { kind: "inconsistent", reason: manifestProblem }
      : { kind: "draft" };
  }
  if (release.draft === false && release.immutable === true) {
    return manifestProblem
      ? { kind: "inconsistent", reason: manifestProblem }
      : { kind: "published" };
  }
  return {
    kind: "inconsistent",
    reason: "release must be a matching draft or an immutable published release",
  };
}

export function planTemplateRelease({
  policy,
  releaseCoordinatesChanged,
  tag,
  release,
  ruleset,
}) {
  const policyProblems = validateTemplateReleaseCoordinates(policy);
  if (policyProblems.length > 0)
    return { action: "fail", reason: policyProblems.join("; ") };
  const rulesetProblem = validateWildcardTagRuleset(ruleset);
  if (rulesetProblem) return { action: "fail", reason: rulesetProblem };

  const resolvedTag = tagStatus({ tag, policy });
  if (resolvedTag.kind === "inconsistent")
    return { action: "fail", reason: resolvedTag.reason };
  if (resolvedTag.kind === "absent") {
    if (release?.status !== "absent")
      return {
        action: "fail",
        reason: "a release exists without its immutable annotated tag",
      };
    return releaseCoordinatesChanged
      ? { action: "create-tag", commit: tag.expectedCommit }
      : { action: "no-op", reason: "release coordinates did not change" };
  }

  if (
    releaseCoordinatesChanged === true &&
    tag.expectedCommit !== resolvedTag.commit
  ) {
    return {
      action: "fail",
      reason:
        "an existing immutable tag does not resolve to the newly authorized release commit",
    };
  }

  const resolvedRelease = releaseStatus({
    release,
    policy,
    commit: resolvedTag.commit,
  });
  if (resolvedRelease.kind === "inconsistent")
    return { action: "fail", reason: resolvedRelease.reason };
  if (resolvedRelease.kind === "published")
    return { action: "no-op", commit: resolvedTag.commit };
  return {
    action: "recover-release",
    commit: resolvedTag.commit,
    release: resolvedRelease.kind,
  };
}

async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 404) return undefined;
  if (!response.ok)
    throw new Error(`GitHub API ${method} ${path} failed with ${response.status}`);
  return response.json();
}

export async function findExactTemplateRelease({
  request,
  tag,
  pageLimit = 5,
}) {
  const matches = [];
  for (let page = 1; page <= pageLimit; page += 1) {
    const releases = await request(`/releases?per_page=100&page=${page}`);
    if (!Array.isArray(releases))
      throw new Error("GitHub release listing did not return an array");
    matches.push(...releases.filter((release) => release.tag_name === tag));
    if (matches.length > 1)
      throw new Error(`Multiple GitHub releases use the immutable tag ${tag}`);
    if (releases.length < 100) return matches[0];
  }
  throw new Error(
    `GitHub release listing exceeded the bounded ${pageLimit}-page search for ${tag}`,
  );
}

function isAncestor(commit) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, "origin/main"], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export async function readTemplateReleaseLiveState({
  repository,
  token,
  policy,
  expectedCommit,
}) {
  const matchingRulesets = (await api(`/repos/${repository}/rulesets`, { token }))
    .filter((candidate) => candidate.name === rulesetName);
  if (matchingRulesets.length !== 1)
    return {
      policy,
      tag: { status: "absent", expectedCommit },
      release: { status: "absent" },
      ruleset: undefined,
    };
  const ruleset = await api(
    `/repos/${repository}/rulesets/${matchingRulesets[0].id}`,
    { token },
  );
  const encodedTag = encodeURIComponent(policy.tag);
  const reference = await api(
    `/repos/${repository}/git/ref/tags/${encodedTag}`,
    { token },
  );
  let tag = { status: "absent", expectedCommit };
  if (reference) {
    const tagObject =
      reference.object?.type === "tag"
        ? await api(`/repos/${repository}/git/tags/${reference.object.sha}`, {
            token,
          })
        : undefined;
    tag = {
      status: "present",
      name: tagObject?.tag,
      annotated: reference.object?.type === "tag" && tagObject?.object?.type === "commit",
      commit: tagObject?.object?.sha,
      ancestor: tagObject?.object?.sha ? isAncestor(tagObject.object.sha) : false,
      expectedCommit,
    };
  }
  const githubRelease = await findExactTemplateRelease({
    request: (path) => api(`/repos/${repository}${path}`, { token }),
    tag: policy.tag,
  });
  let release = { status: "absent" };
  if (githubRelease) {
    const asset = githubRelease.assets?.find((candidate) => candidate.name === manifestName);
    let manifest;
    if (asset?.url) {
      const response = await fetch(asset.url, {
        headers: {
          Accept: "application/octet-stream",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if (!response.ok)
        throw new Error(`Unable to download release manifest: ${response.status}`);
      manifest = await response.json();
    }
    release = {
      status: "present",
      tag: githubRelease.tag_name,
      draft: githubRelease.draft,
      immutable: githubRelease.immutable,
      manifest,
    };
  }
  return { policy, tag, release, ruleset };
}

async function main() {
  const [output, releaseCoordinatesChanged] = process.argv.slice(2);
  if (!output || !["true", "false"].includes(releaseCoordinatesChanged ?? ""))
    throw new Error("usage: template-release-state.mjs OUTPUT true|false");
  const policy = JSON.parse(
    readFileSync(join(root, "contracts/template-release-policy.json"), "utf8"),
  );
  const expectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const state = await readTemplateReleaseLiveState({
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
    policy,
    expectedCommit,
  });
  const plan = planTemplateRelease({
    ...state,
    releaseCoordinatesChanged: releaseCoordinatesChanged === "true",
  });
  if (plan.action === "fail") throw new Error(plan.reason);
  writeFileSync(output, `${JSON.stringify({ ...state, plan }, null, 2)}\n`);
  console.log(`action=${plan.action}`);
  if (plan.commit) console.log(`commit=${plan.commit}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
