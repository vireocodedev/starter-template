import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  validateTemplateReleaseRecovery,
  writeTemplateReleaseRecoveryOutputs,
} from "./template-release-recovery-policy.mjs";

const templateReleasePolicy = { tag: "starter-template@0.6.0" };
const recovery = {
  schemaVersion: 1,
  tag: templateReleasePolicy.tag,
  expectedCommit: "5b123e60bd1ce733ae70711796552a17aaa60fe3",
};

test("validates and writes the trusted template release recovery target", () => {
  assert.deepEqual(
    validateTemplateReleaseRecovery({
      recovery,
      templateReleasePolicy,
      explicitTag: recovery.tag,
    }),
    [],
  );
  const directory = mkdtempSync(join(tmpdir(), "template-release-recovery-"));
  const output = join(directory, "outputs");
  try {
    assert.deepEqual(
      writeTemplateReleaseRecoveryOutputs({
        output,
        recovery,
        templateReleasePolicy,
        explicitTag: recovery.tag,
      }),
      { tag: recovery.tag, commit: recovery.expectedCommit },
    );
    assert.equal(
      readFileSync(output, "utf8"),
      `tag=${recovery.tag}\ncommit=${recovery.expectedCommit}\n`,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects recovery contract and explicit-input drift", () => {
  for (const [key, value] of [
    ["schemaVersion", 2],
    ["tag", "starter-template@0.5.0"],
    ["expectedCommit", "A".repeat(40)],
  ]) {
    assert.ok(
      validateTemplateReleaseRecovery({
        recovery: { ...recovery, [key]: value },
        templateReleasePolicy,
        explicitTag: recovery.tag,
      }).length > 0,
      `${key} must be rejected`,
    );
  }
  assert.ok(
    validateTemplateReleaseRecovery({
      recovery,
      templateReleasePolicy,
      explicitTag: "starter-template@0.5.0",
    }).length > 0,
  );
});
