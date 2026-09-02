import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { launch as launchChrome } from "chrome-launcher";
import lighthouse from "lighthouse";
import { LIGHTHOUSE_SAMPLE_COUNT, evaluateLighthouseSamples } from "./lighthouse-policy.mjs";
import {
  combineAuditFailures,
  createAuditError,
  createLighthouseEvidence,
  finalizeLighthouseSample,
  stopPreviewProcess,
} from "./lighthouse-audit-support.mjs";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDirectory = path.resolve(frontendRoot, "../.performance-evidence");
const preview = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--strictPort"],
  {
    cwd: frontendRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

const audit = {
  aggregation: null,
  failures: [],
  samples: [],
  status: "failed",
};
let primaryFailure = null;

try {
  await waitForUrl("http://127.0.0.1:4173/login", 30_000);
  for (let sampleNumber = 1; sampleNumber <= LIGHTHOUSE_SAMPLE_COUNT; sampleNumber += 1) {
    const sample = await collectSample(sampleNumber);
    audit.samples.push(sample);
  }
  const result = evaluateLighthouseSamples(audit.samples.map(sample => sample.observed));
  audit.aggregation = result.aggregate;
  audit.failures = result.failures;
  if (audit.failures.length > 0) {
    throw createAuditError("LIGHTHOUSE_POLICY_FAILED", "Lighthouse budget policy failed.");
  }
  audit.status = "passed";
} catch (error) {
  primaryFailure = error;
}

const cleanupFailures = [];
try {
  await stopPreviewProcess(preview);
} catch (error) {
  cleanupFailures.push(error);
}

let finalFailure = combineAuditFailures(primaryFailure, cleanupFailures);
if (finalFailure != null) audit.status = "failed";

try {
  await persistEvidence(audit, finalFailure);
} catch (error) {
  const evidenceFailure = createAuditError("EVIDENCE_PERSIST_FAILED", "Lighthouse evidence persistence failed.", error);
  finalFailure = combineAuditFailures(finalFailure, [evidenceFailure]);
}

if (finalFailure != null) throw finalFailure;

console.log(`Lighthouse budgets passed: ${JSON.stringify(audit.aggregation)}.`);

async function persistEvidence(auditResult, error) {
  const failedAccessibilityAudits = auditResult.samples.flatMap(sample =>
    sample.failedAccessibilityAudits.map(audit => ({ ...audit, sample: sample.number })),
  );
  const evidence = createLighthouseEvidence({
    status: auditResult.status,
    source: { commit: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID },
    samples: auditResult.samples,
    aggregation: auditResult.aggregation,
    failedAccessibilityAudits,
    failures: auditResult.failures,
    error,
  });

  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(path.join(evidenceDirectory, "lighthouse.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

async function collectSample(number) {
  let chrome;
  let sample = null;
  let primaryFailure = null;
  try {
    chrome = await launchChrome({
      chromePath: chromium.executablePath(),
      chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
    });
    const result = await lighthouse("http://127.0.0.1:4173/login", {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices"],
    });
    if (!result) throw new Error("Lighthouse returned no result.");

    const report = result.lhr;
    const accessibilityAuditIds = new Set(report.categories.accessibility.auditRefs.map(reference => reference.id));
    sample = {
      number,
      lighthouseVersion: report.lighthouseVersion,
      userAgent: report.userAgent,
      observed: {
        performance: report.categories.performance.score,
        accessibility: report.categories.accessibility.score,
        bestPractices: report.categories["best-practices"].score,
        firstContentfulPaintMs: report.audits["first-contentful-paint"].numericValue,
        largestContentfulPaintMs: report.audits["largest-contentful-paint"].numericValue,
        totalBlockingTimeMs: report.audits["total-blocking-time"].numericValue,
        cumulativeLayoutShift: report.audits["cumulative-layout-shift"].numericValue,
      },
      failedAccessibilityAudits: Object.values(report.audits)
        .filter(audit => accessibilityAuditIds.has(audit.id) && audit.score != null && audit.score < 1)
        .map(audit => ({ id: audit.id, score: audit.score, title: audit.title })),
    };
  } catch (error) {
    primaryFailure = createAuditError(
      "LIGHTHOUSE_SAMPLE_FAILED",
      `Lighthouse sample ${number} could not be collected.`,
      error,
    );
  }

  await finalizeLighthouseSample(primaryFailure, async () => chrome?.kill());
  return sample;
}

async function waitForUrl(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (preview.exitCode != null || preview.signalCode != null) {
      throw createAuditError("PREVIEW_UNAVAILABLE", "Vite preview exited before becoming available.");
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw createAuditError("PREVIEW_UNAVAILABLE", "Timed out waiting for the Vite preview.");
}
