import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { launch as launchChrome } from "chrome-launcher";
import lighthouse from "lighthouse";

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

let chrome;
try {
  await waitForUrl("http://127.0.0.1:4173/login", 30_000);
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
  const observed = {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    bestPractices: report.categories["best-practices"].score,
    firstContentfulPaintMs: report.audits["first-contentful-paint"].numericValue,
    largestContentfulPaintMs: report.audits["largest-contentful-paint"].numericValue,
    totalBlockingTimeMs: report.audits["total-blocking-time"].numericValue,
    cumulativeLayoutShift: report.audits["cumulative-layout-shift"].numericValue,
  };
  const accessibilityAuditIds = new Set(report.categories.accessibility.auditRefs.map(reference => reference.id));
  const failedAccessibilityAudits = Object.values(report.audits)
    .filter(audit => accessibilityAuditIds.has(audit.id) && audit.score != null && audit.score < 1)
    .map(audit => ({ id: audit.id, score: audit.score, title: audit.title }));
  const budgets = {
    performance: { minimum: 0.75 },
    accessibility: { minimum: 1 },
    bestPractices: { minimum: 0.9 },
    firstContentfulPaintMs: { maximum: 4_000 },
    largestContentfulPaintMs: { maximum: 5_000 },
    totalBlockingTimeMs: { maximum: 500 },
    cumulativeLayoutShift: { maximum: 0.1 },
  };
  const failures = [];
  for (const [metric, budget] of Object.entries(budgets)) {
    const value = observed[metric];
    if ("minimum" in budget && (value == null || value < budget.minimum)) {
      failures.push(`${metric} was ${value}; minimum is ${budget.minimum}`);
    }
    if ("maximum" in budget && (value == null || value > budget.maximum)) {
      failures.push(`${metric} was ${value}; maximum is ${budget.maximum}`);
    }
  }

  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    path.join(evidenceDirectory, "lighthouse.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        recordedAt: new Date().toISOString(),
        source: { commit: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID },
        profile: "Lighthouse default mobile emulation against the production /login bundle",
        lighthouseVersion: report.lighthouseVersion,
        userAgent: report.userAgent,
        observed,
        failedAccessibilityAudits,
        budgets,
        failures,
      },
      null,
      2,
    )}\n`,
  );

  if (failures.length > 0) {
    throw new Error(
      `Lighthouse budgets failed:\n- ${failures.join("\n- ")}\nAccessibility findings: ${JSON.stringify(failedAccessibilityAudits)}`,
    );
  }
  console.log(`Lighthouse budgets passed: ${JSON.stringify(observed)}.`);
} finally {
  await chrome?.kill();
  preview.kill("SIGTERM");
}

async function waitForUrl(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (preview.exitCode != null) throw new Error(`Vite preview exited with code ${preview.exitCode}.`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}.`);
}
