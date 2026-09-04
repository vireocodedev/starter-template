import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import { planCiChanges } from "./ci-change-plan.mjs";

const policy = JSON.parse(readFileSync(new URL("../contracts/ci-change-plan-policy.json", import.meta.url), "utf8"));
const intentionalFullVerification = [
  /^\.github\//u,
  /^\.gitleaks\.toml$/u,
  /^contracts\/(?:ci-change-plan-policy|github-actions-policy|verification-budget-policy|toolchain-policy)\.json$/u,
  /^scripts\/(?:ci-change-plan(?:-coverage)?(?:\.test)?|ci-required-contexts(?:\.test)?|workflow-security-policy|repository-security-policy|verification-pipeline-policy)\.mjs$/u,
  /^scripts\/verify-template\.sh$/u,
];

test("every tracked routine file has an explicit non-full routing classification", () => {
  const result = spawnSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  const trackedFiles = new Set([...result.stdout.split("\0").filter(Boolean), "contracts/ci-change-plan-policy.json", "scripts/ci-change-plan.mjs", "scripts/ci-change-plan.test.mjs", "scripts/ci-change-plan-coverage.test.mjs", "scripts/ci-required-contexts.test.mjs"]);
  const unexpected = [...trackedFiles].filter(path => {
    const plan = planCiChanges([{ status: "M", path }], policy);
    return plan.full && !intentionalFullVerification.some(pattern => pattern.test(path));
  });
  assert.deepEqual(unexpected, []);
});
