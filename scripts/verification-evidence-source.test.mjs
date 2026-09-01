import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveVerificationEvidenceSource } from "./verification-evidence-source.mjs";

const command =
  ({ head = "abc", status = "" } = {}) =>
  (_name, args) =>
    args[0] === "rev-parse" ? head : status;

test("resolves clean local evidence source", () => {
  const resolved = resolveVerificationEvidenceSource({ command: command() });
  assert.deepEqual(resolved.source, {
    kind: "git",
    head: "abc",
    commit: "abc",
    workflow: "local",
    runId: null,
    runAttempt: null,
    clean: true,
    authoritative: false,
  });
});

test("marks dirty local evidence and hosted mismatch non-authoritative", () => {
  assert.equal(
    resolveVerificationEvidenceSource({
      command: command({ status: "?? scratch\n" }),
    }).source.clean,
    false,
  );
  const mismatch = resolveVerificationEvidenceSource({
    command: command(),
    env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "def" },
  });
  assert.equal(mismatch.source.authoritative, false);
  assert.match(mismatch.problems.join("\n"), /does not match/u);
  assert.equal(
    resolveVerificationEvidenceSource({
      command: command(),
      env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "abc" },
    }).source.authoritative,
    true,
  );
});

test("requires an explicit nonblank hosted selected SHA", () => {
  for (const sha of [undefined, "   "]) {
    const resolved = resolveVerificationEvidenceSource({
      command: command(),
      env: {
        GITHUB_ACTIONS: "true",
        ...(sha === undefined ? {} : { GITHUB_SHA: sha }),
      },
    });
    assert.equal(resolved.source.authoritative, false);
    assert.match(resolved.problems.join("\n"), /nonblank GITHUB_SHA/u);
  }
});

test("fails actionably when Git source is unavailable or HEAD is empty", () => {
  const gitFailure = new Error("not a repository");
  assert.throws(
    () =>
      resolveVerificationEvidenceSource({
        command: () => {
          throw gitFailure;
        },
      }),
    (error) =>
      /Could not determine Git verification evidence source/u.test(
        error.message,
      ) && error.cause === gitFailure,
  );
  assert.throws(
    () => resolveVerificationEvidenceSource({ command: command({ head: "" }) }),
    /HEAD is empty/u,
  );
});

test("does not enable generated-project fallback when project metadata is absent", () => {
  assert.throws(
    () =>
      resolveVerificationEvidenceSource({
        command: () => {
          throw new Error("not a repository");
        },
        project: undefined,
      }),
    /Could not determine Git verification evidence source/u,
  );
});

test("verification budget policy treats generated metadata as optional", () => {
  const policy = readFileSync(
    new URL("./verification-budget-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.match(
    policy,
    /const projectPath = join\(repositoryRoot, "\.vireo", "project\.json"\);/u,
  );
  assert.match(
    policy,
    /const project = existsSync\(projectPath\)[\s\S]*?: undefined;/u,
  );
});

test("uses immutable generated-project provenance for a local no-Git project", () => {
  const project = {
    projectName: "consumer-app",
    templateCommit: "2aa661d1458b9c2bb5e72f3ec35a6617a2bec04d",
    createdBy: "create-vireo@0.8.0",
  };
  const resolved = resolveVerificationEvidenceSource({
    command: () => {
      throw new Error("not a repository");
    },
    project,
  });
  assert.deepEqual(resolved, {
    source: {
      kind: "generated-project",
      head: null,
      commit: project.templateCommit,
      workflow: "local",
      runId: null,
      runAttempt: null,
      clean: null,
      authoritative: false,
      projectName: project.projectName,
      createdBy: project.createdBy,
    },
    problems: [],
  });
});

test("never substitutes generated-project provenance for hosted Git evidence", () => {
  const gitFailure = new Error("not a repository");
  assert.throws(
    () =>
      resolveVerificationEvidenceSource({
        command: () => {
          throw gitFailure;
        },
        env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "abc" },
        project: {
          projectName: "consumer-app",
          templateCommit: "2aa661d1458b9c2bb5e72f3ec35a6617a2bec04d",
          createdBy: "create-vireo@0.8.0",
        },
      }),
    (error) =>
      /Could not determine Git verification evidence source/u.test(
        error.message,
      ) && error.cause === gitFailure,
  );
});
