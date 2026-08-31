import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readTemplateReleaseInputs,
  validateTemplateReleaseCoordinates,
} from "./template-release-policy.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function createTemplateReleaseManifest({ policy, commit }) {
  const problems = validateTemplateReleaseCoordinates(policy);
  if (problems.length > 0)
    throw new Error(`Invalid template release policy: ${problems.join("; ")}`);
  if (!/^[0-9a-f]{40}$/u.test(commit ?? ""))
    throw new Error(
      "release manifest commit must be a lowercase 40-hex Git SHA",
    );

  return { schemaVersion: 1, ...policy, commit };
}

export function resolveReleaseManifestOutput({
  output,
  root = repositoryRoot,
}) {
  if (typeof output !== "string" || output.trim() === "")
    throw new Error("release manifest output path is required");
  const resolvedOutput = resolve(root, output);
  const relation = relative(root, resolvedOutput);
  if (relation === "" || (!relation.startsWith("..") && !isAbsolute(relation)))
    throw new Error("release manifest output must be outside the repository");
  return resolvedOutput;
}

export function writeTemplateReleaseManifest({ output, policy, commit, root }) {
  const resolvedOutput = resolveReleaseManifestOutput({ output, root });
  const manifest = createTemplateReleaseManifest({ policy, commit });
  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function isMainModule() {
  return (
    process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isMainModule()) {
  writeTemplateReleaseManifest({
    output: process.argv[2],
    policy: readTemplateReleaseInputs().policy,
    commit: process.argv[3] ?? process.env.GITHUB_SHA,
  });
}
