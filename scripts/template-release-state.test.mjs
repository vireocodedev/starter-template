import assert from "node:assert/strict";
import test from "node:test";

import {
  findExactTemplateRelease,
  planTemplateRelease,
  validateReleaseManifest,
  validateWildcardTagRuleset,
} from "./template-release-state.mjs";

const policy = {
  schemaVersion: 1,
  version: "0.8.7",
  tag: "starter-template@0.8.7",
  createVireoVersion: "0.8.7",
  ecosystemRelease: "npm-0.8.7_jvm-0.3.1",
  repository: "vireocodedev/vireo-template",
  releaseUrl:
    "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.8.7",
  immutableReleasesRequired: true,
};
const commit = "a".repeat(40);
const ruleset = {
  name: "Protect starter-template release tags",
  target: "tag",
  enforcement: "active",
  bypass_actors: [],
  conditions: {
    ref_name: { include: ["refs/tags/starter-template@*"], exclude: [] },
  },
  rules: [
    { type: "deletion" },
    { type: "non_fast_forward" },
    { type: "update" },
  ],
};
const manifest = { schemaVersion: 1, ...policy, commit };
const livePresentTag = {
  status: "present",
  name: policy.tag,
  annotated: true,
  commit,
  ancestor: true,
  expectedCommit: commit,
};

test("plans a new release only when release coordinates changed in the main push", () => {
  const state = {
    policy,
    tag: { status: "absent", expectedCommit: commit },
    release: { status: "absent" },
    ruleset,
  };
  assert.deepEqual(planTemplateRelease({ ...state, releaseCoordinatesChanged: true }), {
    action: "create-tag",
    commit,
  });
  assert.deepEqual(planTemplateRelease({ ...state, releaseCoordinatesChanged: false }), {
    action: "no-op",
    reason: "release coordinates did not change",
  });
});

test("treats the current published 0.8.7 release as a no-op after later main commits", () => {
  assert.deepEqual(
    planTemplateRelease({
      policy,
      releaseCoordinatesChanged: false,
      tag: { status: "present", name: policy.tag, annotated: true, commit, ancestor: true },
      release: { status: "present", tag: policy.tag, draft: false, immutable: true, manifest },
      ruleset,
    }),
    { action: "no-op", commit },
  );
});

test("recovers an exact annotated ancestor tag with an absent or matching draft release", () => {
  const state = {
    policy,
    releaseCoordinatesChanged: false,
    tag: { status: "present", name: policy.tag, annotated: true, commit, ancestor: true },
    ruleset,
  };
  assert.deepEqual(planTemplateRelease({ ...state, release: { status: "absent" } }), {
    action: "recover-release",
    commit,
    release: "absent",
  });
  assert.deepEqual(
    planTemplateRelease({
      ...state,
      release: { status: "present", tag: policy.tag, draft: true, manifest },
    }),
    { action: "recover-release", commit, release: "draft" },
  );
});

test("uses the live-state expected commit to accept an exact tag and refuse a race", () => {
  assert.deepEqual(
    planTemplateRelease({
      policy,
      releaseCoordinatesChanged: true,
      tag: livePresentTag,
      release: { status: "absent" },
      ruleset,
    }),
    { action: "recover-release", commit, release: "absent" },
  );
  assert.deepEqual(
    planTemplateRelease({
      policy,
      releaseCoordinatesChanged: true,
      tag: { ...livePresentTag, expectedCommit: "b".repeat(40) },
      release: { status: "absent" },
      ruleset,
    }),
    {
      action: "fail",
      reason:
        "an existing immutable tag does not resolve to the newly authorized release commit",
    },
  );
});

test("finds matching drafts through authenticated bounded release pagination", async () => {
  const calls = [];
  const draft = { id: 7, tag_name: policy.tag, draft: true };
  const release = await findExactTemplateRelease({
    request: async (path) => {
      calls.push(path);
      return path.endsWith("page=1")
        ? Array.from({ length: 100 }, (_, index) => ({ tag_name: `other-${index}` }))
        : [draft];
    },
    tag: policy.tag,
  });
  assert.equal(release, draft);
  assert.deepEqual(calls, ["/releases?per_page=100&page=1", "/releases?per_page=100&page=2"]);
});

test("refuses duplicate release tags and unbounded release pagination", async () => {
  await assert.rejects(
    findExactTemplateRelease({
      request: async () => [
        { tag_name: policy.tag, draft: true },
        { tag_name: policy.tag, draft: false },
      ],
      tag: policy.tag,
    }),
    /Multiple GitHub releases/,
  );
  await assert.rejects(
    findExactTemplateRelease({
      request: async () => Array.from({ length: 100 }, () => ({ tag_name: "other" })),
      tag: policy.tag,
      pageLimit: 2,
    }),
    /bounded 2-page search/,
  );
});

test("fails closed for tag, release, manifest, and wildcard-ruleset drift", () => {
  assert.ok(validateWildcardTagRuleset({ ...ruleset, bypass_actors: [{ actor_id: 1 }] }));
  assert.ok(
    validateWildcardTagRuleset({
      ...ruleset,
      rules: ruleset.rules.filter((rule) => rule.type !== "non_fast_forward"),
    }),
  );
  assert.ok(validateReleaseManifest({ manifest: { ...manifest, commit: "b".repeat(40) }, policy, commit }));
  for (const state of [
    {
      tag: { status: "present", name: policy.tag, annotated: false, commit, ancestor: true },
      release: { status: "absent" },
    },
    {
      tag: { status: "present", name: "starter-template@0.8.6", annotated: true, commit, ancestor: true },
      release: { status: "absent" },
    },
    {
      tag: { status: "present", name: policy.tag, annotated: true, commit, ancestor: false },
      release: { status: "absent" },
    },
    {
      tag: { status: "present", name: policy.tag, annotated: true, commit, ancestor: true },
      release: { status: "present", tag: policy.tag, draft: false, immutable: false, manifest },
    },
  ]) {
    assert.equal(
      planTemplateRelease({ policy, releaseCoordinatesChanged: true, ruleset, ...state }).action,
      "fail",
    );
  }
});
