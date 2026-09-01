import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const releaseVersionPattern = /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const expectedRepository = "vireocodedev/vireo-template";
const ecosystemReleasePattern =
  /^npm-(?<createVireoVersion>0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))_jvm-(?<jvmVersion>0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/u;

function resolveEcosystemRelease(policy) {
  return typeof policy.ecosystemRelease === "string"
    ? policy.ecosystemRelease.match(ecosystemReleasePattern)?.groups
    : undefined;
}

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
  const ecosystemRelease = resolveEcosystemRelease(policy);
  if (ecosystemRelease?.createVireoVersion !== policy.createVireoVersion)
    problems.push(
      "template release policy ecosystemRelease must encode its createVireoVersion and a strict 0.x JVM version",
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
  starterVersion,
  tag,
}) {
  const problems = validateTemplateReleaseCoordinates(policy);
  const ecosystemRelease = resolveEcosystemRelease(policy);

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
  if (starterVersion !== ecosystemRelease?.jvmVersion)
    problems.push(
      "gradle.properties starterVersion must match the JVM version advertised by template release policy ecosystemRelease",
    );
  if (tag !== undefined && tag !== policy.tag)
    problems.push(`tag ${tag} must equal ${policy.tag}`);

  return problems;
}

export function resolveTemplateReleaseTag({
  explicitTag,
  environment = process.env,
} = {}) {
  if (explicitTag !== undefined) return explicitTag;

  const refName = environment.GITHUB_REF_NAME;
  if (environment.GITHUB_REF_TYPE === "tag" && typeof refName === "string")
    return refName;

  const ref = environment.GITHUB_REF;
  const tagPrefix = "refs/tags/";
  if (typeof ref === "string" && ref.startsWith(tagPrefix))
    return ref.slice(tagPrefix.length);

  return undefined;
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
    starterVersion: readFileSync(join(root, "gradle.properties"), "utf8").match(
      /^starterVersion=(.+)$/mu,
    )?.[1],
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
    tag: resolveTemplateReleaseTag({ explicitTag: process.argv[2] }),
  });
  if (problems.length > 0) {
    for (const problem of problems) console.error(problem);
    process.exitCode = 1;
  }
}
