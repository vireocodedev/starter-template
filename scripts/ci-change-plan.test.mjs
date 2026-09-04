import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { parseGitNameStatus, planCiChanges, readExactChanges, validateCiChangePlanPolicy, writeGithubOutput } from "./ci-change-plan.mjs";

const policy = JSON.parse(readFileSync(new URL("../contracts/ci-change-plan-policy.json", import.meta.url), "utf8"));
const changed = (...paths) => paths.map(path => ({ status: "M", path }));

test("ci change-plan policy is complete", () => assert.deepEqual(validateCiChangePlanPolicy(policy), []));
test("rejects malformed policies and missing exact revisions", () => {
  assert.ok(validateCiChangePlanPolicy({ schemaVersion: 0, scopes: {} }).length > 0);
  assert.throws(() => planCiChanges(changed("README.md"), { schemaVersion: 1, scopes: {} }), /must define/u);
  assert.throws(() => readExactChanges("not-a-commit", "HEAD"), /Unable to resolve exact commit/u);
});
test("parses NUL-delimited deletion and rename records", () => {
  assert.deepEqual(parseGitNameStatus(Buffer.from("D\0docs/old.md\0R100\0README.md\0docs/new.md\0")), [{ status: "D", path: "docs/old.md" }, { status: "R", previousPath: "README.md", path: "docs/new.md" }]);
});
test("routes README and docs changes through the cheap documentation lane", () => {
  for (const path of ["README.md", "docs/getting-started.md", "frontend/docs/architecture/README.md"]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.documentation, true, path);
    for (const lane of ["frontend", "jvm", "verification", "deployment", "codeqlJava", "codeqlJavaScript", "dependencyReview"]) assert.equal(plan[lane], false, `${path}:${lane}`);
    assert.equal(plan.full, false, path);
  }
});
test("routes frontend, JVM, and deployment inputs to their owning lanes", () => {
  const frontend = planCiChanges(changed("frontend/src/app/App.tsx"), policy);
  assert.equal(frontend.frontend, true); assert.equal(frontend.verification, true); assert.equal(frontend.deployment, true); assert.equal(frontend.codeqlJavaScript, true); assert.equal(frontend.jvm, false);
  const jvm = planCiChanges(changed("src/main/java/com/vireocode/startertemplate/MainApplication.java"), policy);
  assert.equal(jvm.jvm, true); assert.equal(jvm.verification, true); assert.equal(jvm.deployment, true); assert.equal(jvm.codeqlJava, true); assert.equal(jvm.frontend, false);
  const descriptor = planCiChanges(changed("compose.yaml"), policy);
  assert.equal(descriptor.deployment, true); assert.equal(descriptor.dependencyReview, true);
  for (const path of [".dockerignore", "frontend/.dockerignore"]) {
    assert.equal(planCiChanges(changed(path), policy).deployment, true, path);
  }
  const frontendTest = planCiChanges(changed("frontend/tests/unit/app-pages.test.ts"), policy);
  assert.equal(frontendTest.verification, true); assert.equal(frontendTest.deployment, false);
  const jvmTest = planCiChanges(changed("src/test/java/example/AppTest.java"), policy);
  assert.equal(jvmTest.verification, true); assert.equal(jvmTest.deployment, false);
});
test("routes manifests to dependency review and CI controls fail closed", () => {
  const dependency = planCiChanges(changed("frontend/package-lock.json"), policy);
  assert.equal(dependency.dependencyReview, true); assert.equal(dependency.full, false);
  const control = planCiChanges(changed(".github/workflows/ci.yml"), policy);
  for (const [lane, selected] of Object.entries(control).filter(([name]) => !["full", "changedPaths", "unclassifiedPaths"].includes(name))) assert.equal(selected, true, lane);
  assert.equal(control.full, true);
});
test("unknown, deleted, and renamed paths fail closed", () => {
  assert.equal(planCiChanges(changed("new/unclassified.file"), policy).full, true);
  assert.equal(planCiChanges([{ status: "D", path: "new/deleted.file" }], policy).full, true);
  assert.equal(planCiChanges([{ status: "R", previousPath: "new/old.file", path: "docs/new.md" }], policy).full, true);
});
test("writes stable GitHub output", () => {
  const directory = mkdtempSync(join(tmpdir(), "vireo-template-ci-plan-")); const output = join(directory, "output");
  try {
    writeGithubOutput(planCiChanges(changed("README.md"), policy), output);
    const result = readFileSync(output, "utf8");
    assert.match(result, /^documentation=true$/mu); assert.match(result, /^verification=false$/mu); assert.match(result, /^reason=only relevant verification lanes are enabled$/mu);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
