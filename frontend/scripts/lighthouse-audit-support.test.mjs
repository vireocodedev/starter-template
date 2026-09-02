import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  combineAuditFailures,
  createAuditError,
  createLighthouseEvidence,
  finalizeLighthouseSample,
  sanitizeAuditError,
  stopPreviewProcess,
} from "./lighthouse-audit-support.mjs";

test("failed Lighthouse evidence retains completed samples and sanitizes the source error", () => {
  const unsafeError = createAuditError(
    "LIGHTHOUSE_SAMPLE_FAILED",
    "Chrome failed at /tmp/private-profile?token=secret-value",
  );
  const evidence = createLighthouseEvidence({
    status: "failed",
    source: { commit: "commit", runId: "run" },
    samples: [{ number: 1, observed: { performance: 0.8 } }],
    aggregation: null,
    failedAccessibilityAudits: [],
    failures: [],
    error: unsafeError,
  });

  assert.equal(evidence.schemaVersion, 2);
  assert.equal(evidence.status, "failed");
  assert.equal(evidence.completedSamples, 1);
  assert.deepEqual(evidence.error, {
    code: "LIGHTHOUSE_SAMPLE_FAILED",
    message: "A Lighthouse sample could not be collected.",
  });
  assert.doesNotMatch(JSON.stringify(evidence), /tmp\/private-profile|secret-value/);
});

test("unknown audit errors are replaced with a generic safe evidence error", () => {
  assert.deepEqual(sanitizeAuditError(new Error("password=should-not-appear")), {
    code: "AUDIT_FAILED",
    message: "Lighthouse audit did not complete.",
  });
});

test("preview cleanup sends SIGKILL only after SIGTERM fails to stop the process", async () => {
  const signals = [];
  const process = {
    exitCode: null,
    signalCode: null,
    kill(signal) {
      signals.push(signal);
      return true;
    },
  };
  const waits = [false, true];

  await stopPreviewProcess(process, { waitForExit: async () => waits.shift() });

  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
});

test("preview cleanup does not signal a process that has already exited", async () => {
  let signals = 0;
  const process = {
    exitCode: 0,
    signalCode: null,
    kill() {
      signals += 1;
      return true;
    },
  };

  await stopPreviewProcess(process);

  assert.equal(signals, 0);
});

test("preview cleanup resolves an exit that races with listener registration", async () => {
  class ListenerRaceProcess extends EventEmitter {
    exitCode = null;
    signalCode = null;
    registeredExitListener = false;

    kill() {
      return true;
    }

    once(event, listener) {
      const result = super.once(event, listener);
      if (event === "exit" && !this.registeredExitListener) {
        this.registeredExitListener = true;
        this.exitCode = 0;
      }
      return result;
    }
  }

  await stopPreviewProcess(new ListenerRaceProcess(), {
    graceTimeoutMs: 1,
    forceTimeoutMs: 1,
  });
});

test("preview cleanup accepts kill(false) when the process has exited", async () => {
  const process = {
    exitCode: null,
    signalCode: null,
    kill() {
      this.exitCode = 0;
      return false;
    },
  };

  await stopPreviewProcess(process);
});

test("combined finalization failure retains the primary audit failure", () => {
  const primary = createAuditError("LIGHTHOUSE_POLICY_FAILED", "policy failed");
  const cleanup = createAuditError("PREVIEW_CLEANUP_FAILED", "cleanup failed");
  const failure = combineAuditFailures(primary, [cleanup]);

  assert.ok(failure instanceof AggregateError);
  assert.deepEqual(failure.errors, [primary, cleanup]);
  assert.deepEqual(sanitizeAuditError(failure), {
    code: "LIGHTHOUSE_POLICY_FAILED",
    message: "Lighthouse policy validation failed.",
  });
});

test("Chrome cleanup failure does not replace the primary Lighthouse sample failure", async () => {
  const primary = createAuditError("LIGHTHOUSE_SAMPLE_FAILED", "sample failed");

  await assert.rejects(
    finalizeLighthouseSample(primary, async () => {
      throw new Error("chrome profile /tmp/private-profile failed");
    }),
    error => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors[0], primary);
      assert.deepEqual(sanitizeAuditError(error), {
        code: "LIGHTHOUSE_SAMPLE_FAILED",
        message: "A Lighthouse sample could not be collected.",
      });
      return true;
    },
  );
});
