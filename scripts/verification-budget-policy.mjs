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
      throw new Error(`Expected <metric>=<milliseconds>, found ${argument}`);
    const metric = argument.slice(0, separator);
    const milliseconds = Number(argument.slice(separator + 1));
    if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
      throw new Error(
        `Invalid duration for ${metric}: ${argument.slice(separator + 1)}`,
      );
    }
    return [metric, milliseconds];
  }),
);
const problems = [];

for (const [stage, budget] of Object.entries(policy.stagesMs)) {
  if (observed[stage] === undefined)
    problems.push(`missing duration for ${stage}`);
  else if (observed[stage] > budget)
    problems.push(
      `${stage} took ${observed[stage]} ms; budget is ${budget} ms`,
    );
}
if (observed.total === undefined) problems.push("missing total duration");
else if (observed.total > policy.totalMs)
  problems.push(
    `total took ${observed.total} ms; budget is ${policy.totalMs} ms`,
  );

const evidence = {
  schemaVersion: policy.schemaVersion,
  recordedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA,
  runId: process.env.GITHUB_RUN_ID,
  result: problems.length === 0 ? "success" : "failure",
  observedMs: observed,
  budgetMs: { ...policy.stagesMs, total: policy.totalMs },
};
const evidencePath = join(
  repositoryRoot,
  ".verification-evidence",
  "latest.json",
);
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

if (problems.length > 0) {
  console.error("Verification performance budget failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Verification performance budget passed: ${(observed.total / 1000).toFixed(1)}s of ${(policy.totalMs / 1000).toFixed(0)}s total.`,
);
