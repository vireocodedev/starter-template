import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { planTemplateRelease, readTemplateReleaseLiveState } from "./template-release-state.mjs";

const tagPattern = /^starter-template@(\d+)\.(\d+)\.(\d+)$/u;

export function parseTemplateReleaseTag(tag) {
  const match = tagPattern.exec(tag ?? "");
  return match ? match.slice(1).map(Number) : undefined;
}

function isScannerRecoverableTag(tag) {
  const version = parseTemplateReleaseTag(tag);
  // This automation first shipped in 0.8.8. Older public releases retain their
  // historical/manual recovery contracts and are never checked out by new CI.
  return Boolean(version && (version[0] > 0 || version[1] > 8 || (version[1] === 8 && version[2] >= 8)));
}

export function isAutomationEraTemplateTag(tag) {
  return isScannerRecoverableTag(tag);
}

export function compareTemplateReleaseTags(left, right) {
  const a = parseTemplateReleaseTag(left);
  const b = parseTemplateReleaseTag(right);
  if (!a || !b) throw new Error("Template release tags must be stable starter-template@X.Y.Z versions");
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

export function selectLatestImmutableTemplateRelease(releases) {
  const candidates = (releases ?? []).filter((release) =>
    release?.validated === true &&
    release?.draft === false &&
    release?.prerelease === false &&
    release?.immutable === true &&
    parseTemplateReleaseTag(release.tag_name),
  );
  return candidates.sort((left, right) =>
    compareTemplateReleaseTags(right.tag_name, left.tag_name),
  )[0];
}

function automationEra(tag) {
  return isScannerRecoverableTag(tag);
}

function taggedIdentity(tag) {
  const commit = execFileSync("git", ["rev-parse", `refs/tags/${tag}^{commit}`], { encoding: "utf8" }).trim();
  const type = execFileSync("git", ["cat-file", "-t", `refs/tags/${tag}`], { encoding: "utf8" }).trim();
  if (type !== "tag") throw new Error(`${tag} is not annotated`);
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, "origin/main"], { stdio: "ignore" });
  } catch {
    throw new Error(`${tag} is not an ancestor of main`);
  }
  const policy = JSON.parse(execFileSync("git", ["show", `${commit}:contracts/template-release-policy.json`], { encoding: "utf8" }));
  if (policy.tag !== tag || policy.releaseUrl !== `https://github.com/${policy.repository}/releases/tag/${encodeURIComponent(tag)}`)
    throw new Error(`${tag} tagged release policy does not bind its exact release identity`);
  return { commit, policy };
}

/**
 * Assess releases synchronously before they can influence latest. The existing
 * live-state reader downloads the manifest asset and calls validateReleaseManifest
 * against the tag-owned policy and all bound artifact digests.
 */
export async function validateImmutableTemplateReleases({ releases, repository, token, readState = readTemplateReleaseLiveState }) {
  const validated = [];
  for (const release of releases ?? []) {
    if (release?.immutable === true && String(release.tag_name ?? "").startsWith("starter-template@") &&
      (release.prerelease === true || !parseTemplateReleaseTag(release.tag_name))) {
      throw new Error(`immutable Template release ${release.tag_name} is not a stable exact starter-template@X.Y.Z identity`);
    }
    if (release?.draft || release?.prerelease || release?.immutable !== true || !parseTemplateReleaseTag(release.tag_name)) continue;
    try {
      const { commit, policy } = taggedIdentity(release.tag_name);
      const state = await readState({ repository, token, policy, expectedCommit: commit });
      if (state.tag?.commit !== commit || state.release?.status !== "present" || state.release?.draft !== false || state.release?.immutable !== true)
        throw new Error("live tag/release identity is not immutable");
      // planTemplateRelease is deliberately reached through the authoritative
      // reader: malformed/missing manifests return a fail plan instead of a
      // candidate that can be accidentally marked latest.
      const plan = planTemplateRelease({ ...state, releaseCoordinatesChanged: false });
      if (plan.action !== "no-op") throw new Error(plan.reason ?? "release is not an immutable no-op state");
      validated.push({ ...release, validated: true });
    } catch (error) {
      if (automationEra(release.tag_name)) throw new Error(`durable immutable release ${release.tag_name} failed validation: ${error.message}`);
    }
  }
  return validated;
}

export function planDurableTagRecovery({ refs }) {
  return (refs ?? [])
    .filter((reference) => reference?.ref?.startsWith("refs/tags/starter-template@") && reference?.object?.type === "tag")
    .map((reference) => reference.ref.slice("refs/tags/".length))
    .filter(isScannerRecoverableTag)
    .sort(compareTemplateReleaseTags);
}

async function github(path) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required");
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub API GET ${path} failed with ${response.status}`);
  return response.json();
}

async function paged(path) {
  const values = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await github(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!Array.isArray(response)) throw new Error(`GitHub API ${path} did not return an array`);
    values.push(...response);
    if (response.length < 100) return values;
  }
  throw new Error("durable release reconciliation exceeded its ten-page safety bound");
}

async function main() {
  const [command, file] = process.argv.slice(2);
  if (command === "latest") {
    const selected = selectLatestImmutableTemplateRelease(await validateImmutableTemplateReleases({
      releases: await paged("/releases"), repository: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN,
    }));
    if (!selected) throw new Error("no immutable stable starter-template release exists to mark latest");
    process.stdout.write(`${selected.tag_name}\n`);
    return;
  }
  if (command === "scan") {
    const refs = await paged("/git/matching-refs/tags/starter-template%40");
    await validateImmutableTemplateReleases({
      releases: await paged("/releases"), repository: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN,
    });
    process.stdout.write(`${JSON.stringify(planDurableTagRecovery({ refs }))}\n`);
    return;
  }
  if (command === "plan") {
    const input = JSON.parse(readFileSync(file, "utf8"));
    process.stdout.write(`${JSON.stringify(planDurableTagRecovery(input))}\n`);
    return;
  }
  if (command === "assert-automation-tag") {
    if (!isAutomationEraTemplateTag(file)) throw new Error("durable exact-tag recovery is limited to stable starter-template@0.8.8 and newer");
    process.stdout.write(`${file}\n`);
    return;
  }
  throw new Error("usage: template-release-reconciliation.mjs latest|scan|plan INPUT.json|assert-automation-tag TAG");
}

if (process.argv[1]?.endsWith("template-release-reconciliation.mjs"))
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
