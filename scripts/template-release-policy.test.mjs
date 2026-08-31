import assert from "node:assert/strict";
import test from "node:test";
import {
  validateTemplateRelease,
  validateTemplateReleaseCoordinates,
} from "./template-release-policy.mjs";
import {
  createTemplateReleaseManifest,
  resolveReleaseManifestOutput,
} from "./write-template-release-manifest.mjs";

const policy = {
  schemaVersion: 1,
  version: "0.6.0",
  tag: "starter-template@0.6.0",
  createVireoVersion: "0.6.0",
  ecosystemRelease: "npm-0.6.0_jvm-0.3.0",
  repository: "vireocodedev/starter-template",
  releaseUrl:
    "https://github.com/vireocodedev/starter-template/releases/tag/starter-template%400.6.0",
  immutableReleasesRequired: true,
};
const validInputs = {
  policy,
  packageJson: {
    name: "starter-template",
    private: true,
    version: policy.version,
    scripts: { vireo: "npx --yes --package=create-vireo@0.6.0 vireo" },
  },
  template: {
    schemaVersion: 1,
    profile: "full-stack",
    template: policy.repository,
    version: policy.version,
    tag: policy.tag,
    createVireoVersion: policy.createVireoVersion,
    ecosystemRelease: policy.ecosystemRelease,
  },
  compatibility: { schemaVersion: 1, id: "vireo-template-0.6.0" },
};

test("validates canonical template release coordinates", () => {
  assert.deepEqual(validateTemplateRelease({ ...validInputs }), []);
  assert.deepEqual(
    validateTemplateRelease({ ...validInputs, tag: undefined }),
    [],
  );
  assert.deepEqual(
    validateTemplateRelease({ ...validInputs, tag: policy.tag }),
    [],
  );
});

test("rejects each release-coordinate mismatch", () => {
  for (const [field, value] of [
    ["schemaVersion", 2],
    ["version", "1.0.0"],
    ["tag", "starter-template@0.5.0"],
    ["createVireoVersion", "0.5.0"],
    ["ecosystemRelease", "npm-0.6.0_jvm-0.2.0"],
    ["repository", "example/template"],
    ["releaseUrl", "https://example.test/release"],
    ["immutableReleasesRequired", false],
  ]) {
    const problems = validateTemplateReleaseCoordinates({
      ...policy,
      [field]: value,
    });
    assert.ok(problems.length > 0, `${field} must be rejected`);
  }
});

test("rejects every local coordinate drift and a supplied tag mismatch", () => {
  for (const [key, value] of [
    ["packageJson", { ...validInputs.packageJson, name: "other" }],
    ["packageJson", { ...validInputs.packageJson, private: false }],
    ["packageJson", { ...validInputs.packageJson, version: "0.5.0" }],
    ["packageJson", { ...validInputs.packageJson, scripts: {} }],
    ["template", { ...validInputs.template, version: "0.5.0" }],
    ["template", { ...validInputs.template, tag: "starter-template@0.5.0" }],
    ["template", { ...validInputs.template, createVireoVersion: "0.5.0" }],
    [
      "template",
      { ...validInputs.template, ecosystemRelease: "npm-0.5.0_jvm-0.3.0" },
    ],
    ["template", { ...validInputs.template, schemaVersion: 2 }],
    ["template", { ...validInputs.template, profile: "frontend" }],
    ["template", { ...validInputs.template, template: "example/template" }],
    ["compatibility", { schemaVersion: 1, id: "vireo-template-0.5.0" }],
    ["compatibility", { schemaVersion: 2, id: validInputs.compatibility.id }],
  ]) {
    assert.ok(
      validateTemplateRelease({ ...validInputs, [key]: value }).length > 0,
    );
  }
  assert.ok(
    validateTemplateRelease({ ...validInputs, tag: "starter-template@0.5.0" })
      .length > 0,
  );
});

test("creates a deterministic manifest and rejects unsafe release inputs", () => {
  const commit = "a".repeat(40);
  assert.deepEqual(createTemplateReleaseManifest({ policy, commit }), {
    schemaVersion: 1,
    ...policy,
    commit,
  });
  for (const invalidCommit of [undefined, "A".repeat(40), "a".repeat(39)]) {
    assert.throws(() =>
      createTemplateReleaseManifest({ policy, commit: invalidCommit }),
    );
  }
  assert.throws(() => resolveReleaseManifestOutput({ output: "" }));
  assert.throws(() =>
    resolveReleaseManifestOutput({
      output: "release-manifest.json",
      root: "/repo",
    }),
  );
  assert.equal(
    resolveReleaseManifestOutput({
      output: "/tmp/release-manifest.json",
      root: "/repo",
    }),
    "/tmp/release-manifest.json",
  );
});
