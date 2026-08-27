import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(
  readFileSync(
    join(repositoryRoot, "contracts", "verification-budget-policy.json"),
    "utf8",
  ),
);
const observed = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const separator = argument.indexOf("=");
    if (separator < 1)
      throw new Error(`Expected <metric>=<value>, found ${argument}`);
    const metric = argument.slice(0, separator);
    const value = Number(argument.slice(separator + 1));
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(
        `Invalid value for ${metric}: ${argument.slice(separator + 1)}`,
      );
    }
    return [metric, value];
  }),
);
const problems = [];
const warnings = [];
const observedStages = {};

function validateThresholds(id, thresholds) {
  for (const unit of ["Ms", "RssKiB"]) {
    const baseline = thresholds[`baseline${unit}`];
    const warning = thresholds[`warning${unit}`];
    const failure = thresholds[`failure${unit}`];
    if (
      ![baseline, warning, failure].every(Number.isSafeInteger) ||
      baseline < 0 ||
      baseline > warning ||
      warning > failure
    ) {
      problems.push(
        `${id} has invalid baseline/warning/failure ${unit} thresholds`,
      );
    }
  }
}

function evaluate(id, label, thresholds, durationMs, peakRssKiB) {
  validateThresholds(id, thresholds);
  if (durationMs === undefined) problems.push(`missing duration for ${id}`);
  if (peakRssKiB === undefined) problems.push(`missing peak RSS for ${id}`);
  if (durationMs !== undefined) {
    if (durationMs > thresholds.failureMs) {
      problems.push(
        `${label} took ${durationMs} ms; failure threshold is ${thresholds.failureMs} ms`,
      );
    } else if (durationMs > thresholds.warningMs) {
      warnings.push(
        `${label} took ${durationMs} ms; warning threshold is ${thresholds.warningMs} ms`,
      );
    }
  }
  if (peakRssKiB !== undefined) {
    if (peakRssKiB > thresholds.failureRssKiB) {
      problems.push(
        `${label} used ${peakRssKiB} KiB peak RSS; failure threshold is ${thresholds.failureRssKiB} KiB`,
      );
    } else if (peakRssKiB > thresholds.warningRssKiB) {
      warnings.push(
        `${label} used ${peakRssKiB} KiB peak RSS; warning threshold is ${thresholds.warningRssKiB} KiB`,
      );
    }
  }
}

for (const [stage, thresholds] of Object.entries(policy.stages ?? {})) {
  const durationMs = observed[`duration.${stage}`];
  const peakRssKiB = observed[`rss.${stage}`];
  observedStages[stage] = { durationMs, peakRssKiB };
  evaluate(
    stage,
    thresholds.label ?? stage,
    thresholds,
    durationMs,
    peakRssKiB,
  );
}

const totalDurationMs = observed["duration.total"];
const measuredRssValues = Object.values(observedStages)
  .map((stage) => stage.peakRssKiB)
  .filter(Number.isSafeInteger);
const totalPeakRssKiB =
  measuredRssValues.length > 0 ? Math.max(...measuredRssValues) : undefined;
evaluate(
  "total",
  "Complete gate",
  policy.total,
  totalDurationMs,
  totalPeakRssKiB,
);

if (policy.schemaVersion !== 2)
  problems.push(`unsupported policy schema ${policy.schemaVersion}`);
if (process.env.GITHUB_ACTIONS === "true") {
  if (process.env.RUNNER_OS !== "Linux")
    problems.push(
      `canonical evidence requires Linux, found ${process.env.RUNNER_OS}`,
    );
  if (process.env.RUNNER_ARCH !== "X64")
    problems.push(
      `canonical evidence requires X64, found ${process.env.RUNNER_ARCH}`,
    );
  if (process.env.ImageOS && !process.env.ImageOS.startsWith("ubuntu24")) {
    problems.push(
      `canonical evidence requires Ubuntu 24.04, found ${process.env.ImageOS}`,
    );
  }
}

const evidence = {
  schemaVersion: policy.schemaVersion,
  recordedAt: new Date().toISOString(),
  source: {
    commit: process.env.GITHUB_SHA,
    workflow: process.env.GITHUB_WORKFLOW,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
  },
  host: {
    canonical: policy.canonicalHost,
    observed: {
      os: process.env.RUNNER_OS ?? process.platform,
      architecture: process.env.RUNNER_ARCH ?? process.arch,
      runnerImage: process.env.ImageOS,
    },
  },
  measurement: policy.measurement,
  result:
    problems.length > 0
      ? "failure"
      : warnings.length > 0
        ? "warning"
        : "success",
  observed: {
    stages: observedStages,
    total: { durationMs: totalDurationMs, peakRssKiB: totalPeakRssKiB },
  },
  thresholds: {
    stages: policy.stages,
    total: policy.total,
  },
  warnings,
  problems,
};
const evidencePath = join(
  repositoryRoot,
  ".verification-evidence",
  "latest.json",
);
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

for (const warning of warnings) console.warn(`Performance warning: ${warning}`);
if (problems.length > 0) {
  console.error("Verification performance policy failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const seconds = (totalDurationMs / 1000).toFixed(1);
const peakMiB = (totalPeakRssKiB / 1024).toFixed(0);
console.log(
  `Verification performance policy passed: ${seconds}s total, ${peakMiB} MiB peak RSS, ${warnings.length} warning(s).`,
);
