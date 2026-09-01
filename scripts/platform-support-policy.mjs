import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const allowedLogicalRepositories = new Set([
  "starter",
  "starter-template",
]);
export const logicalRepository = "starter-template";
export const logicalDocumentationPath = "docs/platform-support-evidence.md";
const allowedStatuses = new Set([
  "supported",
  "compatible",
  "experimental",
  "untested",
  "unsupported",
]);
const allowedRequirements = new Set(["required", "advisory", "manual", "none"]);
const allowedCadences = new Set(["merge", "scheduled", "manual"]);
const compareArgumentIndex = process.argv.indexOf("--compare");

export function validatePlatformSupportPolicy({
  root = repositoryRoot,
  repository = logicalRepository,
  documentationPath = logicalDocumentationPath,
  comparePath,
} = {}) {
  const policy = JSON.parse(
    readFileSync(join(root, "contracts/platform-support-policy.json"), "utf8"),
  );
  const documentation = readFileSync(join(root, documentationPath), "utf8");
  const problems = [];
  let localWorkflowLanes = 0;

  if (!allowedLogicalRepositories.has(repository)) {
    problems.push(`unknown logical repository ${JSON.stringify(repository)}`);
  }

  const comparisonPath =
    comparePath ??
    (compareArgumentIndex >= 0
      ? process.argv[compareArgumentIndex + 1]
      : undefined);
  if (compareArgumentIndex >= 0 && !comparisonPath) {
    problems.push("--compare requires a canonical policy path");
  } else if (comparisonPath) {
    const canonicalPolicy = JSON.parse(readFileSync(comparisonPath, "utf8"));
    if (JSON.stringify(canonicalPolicy) !== JSON.stringify(policy)) {
      problems.push(
        `local policy does not semantically match ${comparisonPath}`,
      );
    }
  }

  function requireEqual(label, actual, expected) {
    if (actual !== expected)
      problems.push(
        `${label}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`,
      );
  }

  requireEqual("schemaVersion", policy.schemaVersion, 1);
  if (!/^\d{4}-\d{2}-\d{2}\.\d+$/u.test(policy.policyVersion ?? "")) {
    problems.push("policyVersion must be a dated monotonic identifier");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(policy.reviewedAt ?? "")) {
    problems.push("reviewedAt must be an ISO date");
  }
  requireEqual("canonical host OS", policy.canonicalHost?.os, "ubuntu-24.04");
  requireEqual(
    "canonical host architecture",
    policy.canonicalHost?.architecture,
    "x64",
  );

  const rows = Array.isArray(policy.rows) ? policy.rows : [];
  const rowIds = new Set();
  for (const row of rows) {
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(row.id ?? ""))
      problems.push(`invalid row id ${JSON.stringify(row.id)}`);
    if (rowIds.has(row.id)) problems.push(`duplicate row id ${row.id}`);
    rowIds.add(row.id);
    if (!allowedStatuses.has(row.status))
      problems.push(`${row.id} has invalid status ${row.status}`);
    if (!allowedRequirements.has(row.evidence?.requirement)) {
      problems.push(
        `${row.id} has invalid evidence requirement ${row.evidence?.requirement}`,
      );
    }
    if (!allowedCadences.has(row.evidence?.cadence)) {
      problems.push(`${row.id} has invalid cadence ${row.evidence?.cadence}`);
    }
    const lanes = Array.isArray(row.evidence?.lanes) ? row.evidence.lanes : [];
    if (
      row.status === "supported" &&
      row.evidence?.requirement !== "required"
    ) {
      problems.push(`${row.id} is supported without required evidence`);
    }
    if (row.status === "supported" && lanes.length === 0) {
      problems.push(
        `${row.id} is supported without an executable evidence lane`,
      );
    }
    if (
      row.status === "compatible" &&
      !["required", "advisory"].includes(row.evidence?.requirement)
    ) {
      problems.push(
        `${row.id} is compatible without required or advisory evidence`,
      );
    }
    if (
      row.status === "experimental" &&
      !["advisory", "manual"].includes(row.evidence?.requirement)
    ) {
      problems.push(
        `${row.id} is experimental without advisory or manual evidence`,
      );
    }
    if (
      row.status === "untested" &&
      !["manual", "none"].includes(row.evidence?.requirement)
    ) {
      problems.push(`${row.id} is untested but claims automated evidence`);
    }

    for (const lane of lanes) {
      if (!allowedLogicalRepositories.has(lane?.repository)) {
        problems.push(
          `${row.id} references unknown logical repository ${JSON.stringify(lane?.repository)}`,
        );
        continue;
      }
      if (lane.repository !== repository) continue;
      localWorkflowLanes += 1;
      const workflowPath = join(root, ".github", "workflows", lane.workflow);
      if (!existsSync(workflowPath)) {
        problems.push(
          `${row.id} references missing local workflow ${lane.workflow}`,
        );
        continue;
      }
      const workflow = readFileSync(workflowPath, "utf8");
      const escapedJob = lane.job.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      const jobPattern = new RegExp(`^ {2}${escapedJob}:\\s*$`, "mu");
      if (!jobPattern.test(workflow))
        problems.push(
          `${row.id} references missing job ${lane.job} in ${lane.workflow}`,
        );
      if (
        row.evidence.cadence === "scheduled" &&
        !/^ {2}schedule:/mu.test(workflow)
      ) {
        problems.push(
          `${row.id} requires scheduled evidence but ${lane.workflow} has no schedule trigger`,
        );
      }
    }
  }

  const documentedRows = new Map(
    documentation
      .split(/\r?\n/u)
      .filter((line) => line.startsWith("| `"))
      .map((line) => {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
        return [cells[0], cells];
      }),
  );
  for (const row of rows) {
    const expected = [
      `\`${row.id}\``,
      row.status,
      row.evidence.requirement,
      row.evidence.cadence,
    ];
    if (
      JSON.stringify(documentedRows.get(expected[0])) !==
      JSON.stringify(expected)
    ) {
      problems.push(
        `${documentationPath} must classify ${row.id} as ${expected.join(" / ")}`,
      );
    }
  }

  const supported = rows.filter((row) => row.status === "supported").length;
  const qualified = rows.length - supported;
  if (supported === 0 || qualified === 0)
    problems.push(
      "matrix must contain supported and explicitly qualified rows",
    );

  if (localWorkflowLanes === 0) {
    problems.push(`${repository} has no matching local workflow lanes`);
  }

  return {
    problems,
    summary: `Platform support policy passed: ${rows.length} rows (${supported} supported, ${qualified} compatible/experimental/untested) with local workflow and documentation coverage.`,
    localWorkflowLanes,
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = validatePlatformSupportPolicy();
  if (result.problems.length > 0) {
    console.error("Platform support policy failed:");
    for (const problem of result.problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(result.summary);
}
