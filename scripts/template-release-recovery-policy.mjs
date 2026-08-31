import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readTemplateReleaseInputs } from "./template-release-policy.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const commitPattern = /^[0-9a-f]{40}$/u;

export function validateTemplateReleaseRecovery({
  recovery,
  templateReleasePolicy,
  explicitTag,
}) {
  const problems = [];

  if (recovery?.schemaVersion !== 1)
    problems.push("template release recovery schemaVersion must equal 1");
  if (recovery?.tag !== templateReleasePolicy?.tag)
    problems.push(
      "template release recovery tag must match the current template release policy",
    );
  if (!commitPattern.test(recovery?.expectedCommit ?? ""))
    problems.push(
      "template release recovery expectedCommit must be a lowercase 40-hex Git SHA",
    );
  if (explicitTag !== recovery?.tag)
    problems.push("explicit recovery tag must exactly match the recovery contract");

  return problems;
}

export function writeTemplateReleaseRecoveryOutputs({
  output,
  recovery,
  templateReleasePolicy,
  explicitTag,
}) {
  if (typeof output !== "string" || output.trim() === "")
    throw new Error("template release recovery output path is required");

  const problems = validateTemplateReleaseRecovery({
    recovery,
    templateReleasePolicy,
    explicitTag,
  });
  if (problems.length > 0)
    throw new Error(`Invalid template release recovery: ${problems.join("; ")}`);

  appendFileSync(
    output,
    `tag=${recovery.tag}\ncommit=${recovery.expectedCommit}\n`,
  );
  return { tag: recovery.tag, commit: recovery.expectedCommit };
}

export function readTemplateReleaseRecoveryInputs(root = repositoryRoot) {
  return {
    recovery: JSON.parse(
      readFileSync(
        join(root, "contracts/template-release-recovery.json"),
        "utf8",
      ),
    ),
    templateReleasePolicy: readTemplateReleaseInputs(root).policy,
  };
}

function isMainModule() {
  return (
    process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isMainModule()) {
  writeTemplateReleaseRecoveryOutputs({
    ...readTemplateReleaseRecoveryInputs(),
    output: process.argv[2] ?? process.env.GITHUB_OUTPUT,
    explicitTag: process.argv[3],
  });
}
