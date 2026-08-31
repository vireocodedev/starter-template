import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const releaseVersionPattern = /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const expectedRepository = "vireocodedev/starter-template";
const expectedJvmVersion = "0.3.0";

export function validateTemplateReleaseCoordinates(policy) {
  const problems = [];

  if (policy.schemaVersion !== 1)
    problems.push("template release policy schemaVersion must equal 1");
  if (!releaseVersionPattern.test(policy.version ?? ""))
    problems.push(
      "template release policy version must be a strict 0.x semver",
    );
  if (policy.tag !== `starter-template@${policy.version}`)
    problems.push(
      "template release policy tag must equal starter-template@version",
    );
  if (policy.createVireoVersion !== policy.version)
    problems.push(
      "template release policy createVireoVersion must equal version",
    );
  if (
    policy.ecosystemRelease !==
    `npm-${policy.createVireoVersion}_jvm-${expectedJvmVersion}`
  )
    problems.push(
      `template release policy ecosystemRelease must equal npm-createVireoVersion_jvm-${expectedJvmVersion}`,
    );
  if (policy.repository !== expectedRepository)
    problems.push(
      `template release policy repository must equal ${expectedRepository}`,
    );
  if (
    policy.releaseUrl !==
    `https://github.com/${policy.repository}/releases/tag/${encodeURIComponent(policy.tag ?? "")}`
  )
    problems.push(
      "template release policy releaseUrl must be the encoded tag URL",
    );
  if (policy.immutableReleasesRequired !== true)
    problems.push(
      "template release policy immutableReleasesRequired must be true",
    );

  return problems;
}

export function validateTemplateRelease({
  policy,
  packageJson,
  template,
  compatibility,
  tag,
}) {
  const problems = validateTemplateReleaseCoordinates(policy);

  if (packageJson.name !== "starter-template")
    problems.push("package.json name must equal starter-template");
  if (packageJson.private !== true)
    problems.push("package.json private must be true");
  if (packageJson.version !== policy.version)
    problems.push("package.json version must match template release policy");
  if (
    packageJson.scripts?.vireo !==
    `npx --yes --package=create-vireo@${policy.createVireoVersion} vireo`
  )
    problems.push(
      "package.json vireo script must match template release policy",
    );

  for (const [field, value] of Object.entries({
    version: policy.version,
    tag: policy.tag,
    createVireoVersion: policy.createVireoVersion,
    ecosystemRelease: policy.ecosystemRelease,
  })) {
    if (template[field] !== value)
      problems.push(
        `.vireo/template.json ${field} must match template release policy`,
      );
  }
  if (template.schemaVersion !== 1)
    problems.push(".vireo/template.json schemaVersion must equal 1");
  if (template.profile !== "full-stack")
    problems.push(".vireo/template.json profile must equal full-stack");
  if (template.template !== policy.repository)
    problems.push(
      ".vireo/template.json template must match template release policy repository",
    );
  if (compatibility.id !== `vireo-template-${policy.version}`)
    problems.push(
      "compatibility contract id must match template release policy",
    );
  if (compatibility.schemaVersion !== 1)
    problems.push("compatibility contract schemaVersion must equal 1");
  if (tag && tag !== policy.tag)
    problems.push(`tag ${tag} must equal ${policy.tag}`);

  return problems;
}

export function readTemplateReleaseInputs(root = repositoryRoot) {
  return {
    policy: JSON.parse(
      readFileSync(
        join(root, "contracts/template-release-policy.json"),
        "utf8",
      ),
    ),
    packageJson: JSON.parse(readFileSync(join(root, "package.json"), "utf8")),
    template: JSON.parse(
      readFileSync(join(root, ".vireo/template.json"), "utf8"),
    ),
    compatibility: JSON.parse(
      readFileSync(
        join(root, "contracts/vireo-package-compatibility.json"),
        "utf8",
      ),
    ),
  };
}

function isMainModule() {
  return (
    process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isMainModule()) {
  const problems = validateTemplateRelease({
    ...readTemplateReleaseInputs(),
    tag: process.argv[2] ?? process.env.GITHUB_REF_NAME,
  });
  if (problems.length > 0) {
    for (const problem of problems) console.error(problem);
    process.exitCode = 1;
  }
}
