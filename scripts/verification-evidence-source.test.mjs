import assert from "node:assert/strict";
import test from "node:test";
import { resolveVerificationEvidenceSource } from "./verification-evidence-source.mjs";

const command = ({ head = "abc", status = "" } = {}) => (_name, args) => (args[0] === "rev-parse" ? head : status);

test("resolves clean local evidence source", () => {
  const resolved = resolveVerificationEvidenceSource({ command: command() });
  assert.deepEqual(resolved.source, { head: "abc", commit: "abc", workflow: "local", runId: null, runAttempt: null, clean: true, authoritative: false });
});

test("marks dirty local evidence and hosted mismatch non-authoritative", () => {
  assert.equal(resolveVerificationEvidenceSource({ command: command({ status: "?? scratch\n" }) }).source.clean, false);
  const mismatch = resolveVerificationEvidenceSource({ command: command(), env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "def" } });
  assert.equal(mismatch.source.authoritative, false);
  assert.match(mismatch.problems.join("\n"), /does not match/u);
  assert.equal(resolveVerificationEvidenceSource({ command: command(), env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "abc" } }).source.authoritative, true);
});

test("requires an explicit nonblank hosted selected SHA", () => {
  for (const sha of [undefined, "   "]) {
    const resolved = resolveVerificationEvidenceSource({ command: command(), env: { GITHUB_ACTIONS: "true", ...(sha === undefined ? {} : { GITHUB_SHA: sha }) } });
    assert.equal(resolved.source.authoritative, false);
    assert.match(resolved.problems.join("\n"), /nonblank GITHUB_SHA/u);
  }
});

test("fails actionably when Git source is unavailable or HEAD is empty", () => {
  const gitFailure = new Error("not a repository");
  assert.throws(
    () => resolveVerificationEvidenceSource({ command: () => { throw gitFailure; } }),
    error => /Could not determine Git verification evidence source/u.test(error.message) && error.cause === gitFailure,
  );
  assert.throws(() => resolveVerificationEvidenceSource({ command: command({ head: "" }) }), /HEAD is empty/u);
});
