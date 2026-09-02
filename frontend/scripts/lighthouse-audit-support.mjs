import { LIGHTHOUSE_SAMPLE_COUNT, lighthouseBudgets } from "./lighthouse-policy.mjs";

const safeErrorMessages = {
  PREVIEW_UNAVAILABLE: "Production preview did not become available.",
  LIGHTHOUSE_SAMPLE_FAILED: "A Lighthouse sample could not be collected.",
  LIGHTHOUSE_POLICY_FAILED: "Lighthouse policy validation failed.",
  CHROME_CLEANUP_FAILED: "Lighthouse Chrome cleanup did not complete.",
  PREVIEW_CLEANUP_FAILED: "Production preview cleanup did not complete.",
  EVIDENCE_PERSIST_FAILED: "Lighthouse evidence could not be persisted.",
};

export function createAuditError(code, message, cause) {
  const error = new Error(message, cause === undefined ? undefined : { cause });
  error.code = code;
  return error;
}

export function sanitizeAuditError(error) {
  const code = findSafeErrorCode(error) ?? "AUDIT_FAILED";
  return {
    code,
    message: safeErrorMessages[code] ?? "Lighthouse audit did not complete.",
  };
}

export function createLighthouseEvidence({
  status,
  source,
  samples,
  aggregation,
  failedAccessibilityAudits,
  failures,
  error,
}) {
  return {
    schemaVersion: 2,
    recordedAt: new Date().toISOString(),
    status,
    source,
    profile: {
      target: "Lighthouse default mobile emulation against the production /login bundle",
      samples: LIGHTHOUSE_SAMPLE_COUNT,
      browser: "A fresh headless Chrome process per sample against one shared production preview server",
    },
    completedSamples: samples.length,
    samples,
    aggregation:
      aggregation == null
        ? null
        : {
            performanceAndTiming: "median",
            accessibilityAndBestPractices: "minimum",
            observed: aggregation,
          },
    failedAccessibilityAudits,
    budgets: lighthouseBudgets,
    failures,
    error: error == null ? null : sanitizeAuditError(error),
  };
}

export async function stopPreviewProcess(preview, options = {}) {
  const graceTimeoutMs = options.graceTimeoutMs ?? 5_000;
  const forceTimeoutMs = options.forceTimeoutMs ?? 5_000;
  const waitForExit = options.waitForExit ?? waitForProcessExit;

  if (hasExited(preview)) return;
  sendSignal(preview, "SIGTERM");
  if (await waitForExit(preview, graceTimeoutMs)) return;

  sendSignal(preview, "SIGKILL");
  if (await waitForExit(preview, forceTimeoutMs)) return;

  throw createAuditError("PREVIEW_CLEANUP_FAILED", "Preview process did not terminate after SIGKILL.");
}

export function combineAuditFailures(primaryFailure, finalizationFailures) {
  const materialFinalizationFailures = finalizationFailures.filter(Boolean);
  if (primaryFailure == null) {
    if (materialFinalizationFailures.length === 0) return null;
    if (materialFinalizationFailures.length === 1) return materialFinalizationFailures[0];
    return new AggregateError(materialFinalizationFailures, "Lighthouse finalization failed.");
  }
  if (materialFinalizationFailures.length === 0) return primaryFailure;
  return new AggregateError(
    [primaryFailure, ...materialFinalizationFailures],
    "Lighthouse audit failed and finalization also failed.",
  );
}

export async function finalizeLighthouseSample(primaryFailure, closeChrome) {
  let cleanupFailure = null;
  try {
    await closeChrome();
  } catch (error) {
    cleanupFailure = createAuditError("CHROME_CLEANUP_FAILED", "Chrome cleanup failed.", error);
  }

  const finalFailure = combineAuditFailures(primaryFailure, [cleanupFailure]);
  if (finalFailure != null) throw finalFailure;
}

function hasExited(process) {
  return process.exitCode != null || process.signalCode != null;
}

function findSafeErrorCode(error) {
  if (typeof error?.code === "string" && safeErrorMessages[error.code]) return error.code;
  if (error instanceof AggregateError) {
    return error.errors.map(findSafeErrorCode).find(Boolean);
  }
  return null;
}

function sendSignal(process, signal) {
  try {
    if (process.kill(signal) === false && !hasExited(process)) {
      throw new Error("process was not running");
    }
  } catch (error) {
    throw createAuditError("PREVIEW_CLEANUP_FAILED", `Preview process rejected ${signal}.`, error);
  }
}

function waitForProcessExit(process, timeoutMs) {
  if (hasExited(process)) return Promise.resolve(true);

  return new Promise(resolve => {
    let settled = false;
    let timeout = null;
    const finish = result => {
      if (settled) return;
      settled = true;
      if (timeout != null) clearTimeout(timeout);
      process.off("exit", onExit);
      process.off("close", onExit);
      resolve(result);
    };
    const onExit = () => finish(true);
    process.once("exit", onExit);
    process.once("close", onExit);
    if (hasExited(process)) {
      finish(true);
      return;
    }
    timeout = setTimeout(() => finish(false), timeoutMs);
  });
}
