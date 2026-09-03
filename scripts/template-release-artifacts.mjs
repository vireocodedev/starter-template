import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const canonicalMavenGroup = "com.vireocode";
export const artifactNpmPackages = ["history", "infrastructure", "localization", "query", "shell", "sqlite", "ui"].map((name) => `@vireocodedev/${name}`);
export const artifactMavenModules = ["vireo-bom", "vireo-core", "vireo-auth", "vireo-query", "vireo-offline", "vireo-history"];
export const requiredArtifactFiles = [
  "contracts/template-release-policy.json",
  ".vireo/template.json",
  "package.json",
  "frontend/package.json",
  "frontend/package-lock.json",
  "gradle.properties",
  "contracts/vireo-package-compatibility.json",
  "contracts/project-upgrade-policy.json",
];
export const digest = (value) => createHash("sha256").update(value).digest("hex");
function sortedRecord(record = {}) {
  return Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)));
}

// This exact JSON input is shared with Vireo's release-adoption validator.  File
// provenance is deliberately separate: it is Template-local release evidence,
// while this digest identifies only public package coordinates.
export const canonicalArtifactPayload = ({ npm, maven }) => JSON.stringify({
  npm: sortedRecord(npm),
  maven: {
    ...maven,
    modules: sortedRecord(maven?.modules),
  },
});

export const canonicalFilePayload = ({ files }) => JSON.stringify(sortedRecord(files));

export function createPreparedArtifactBinding({
  templateVersion,
  createVireoVersion,
  npm,
  maven,
  files,
}) {
  const binding = {
    schemaVersion: 1,
    prepared: true,
    mavenGroup: canonicalMavenGroup,
    templateVersion,
    createVireoVersion,
    npm: sortedRecord(npm),
    maven: { ...maven, modules: sortedRecord(maven?.modules) },
    files: sortedRecord(files),
  };
  return {
    ...binding,
    coordinateDigest: digest(canonicalArtifactPayload(binding)),
    fileDigest: digest(canonicalFilePayload(binding)),
  };
}

export function validatePreparedArtifactBinding(binding, { version } = {}) {
  const problems = [];
  if (binding?.schemaVersion !== 1 || binding?.prepared !== true)
    problems.push("artifact binding must be prepared schemaVersion 1");
  if (binding?.mavenGroup !== canonicalMavenGroup)
    problems.push("artifact binding must declare the canonical Maven group");
  if (version && binding?.templateVersion !== version)
    problems.push("artifact binding templateVersion must match the release policy");
  if (binding?.createVireoVersion !== binding?.templateVersion)
    problems.push("artifact binding create-vireo version must match the Template version");
  const npm = binding?.npm;
  if (JSON.stringify(Object.keys(npm ?? {}).sort()) !== JSON.stringify([...artifactNpmPackages].sort()))
    problems.push("artifact binding must contain exactly seven Vireo npm packages");
  for (const [name, coordinate] of Object.entries(npm ?? {})) {
    if (!artifactNpmPackages.includes(name) || !/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u.test(coordinate?.version ?? "")) problems.push(`invalid npm coordinate ${name}`);
    if (coordinate?.tarball !== `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${coordinate?.version}.tgz`) problems.push(`non-canonical npm tarball for ${name}`);
    if (typeof coordinate?.integrity !== "string" || !coordinate.integrity.startsWith("sha512-")) problems.push(`missing npm integrity for ${name}`);
    if (typeof coordinate?.attestation !== "string" || !coordinate.attestation.startsWith("https://")) problems.push(`missing npm attestation metadata for ${name}`);
    if (!/^[0-9a-f]{64}$/u.test(coordinate?.attestationBundleSha256 ?? "")) problems.push(`missing npm attestation audit evidence for ${name}`);
  }
  const maven = binding?.maven;
  if (maven?.group !== canonicalMavenGroup || !/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u.test(maven?.version ?? "")) problems.push("artifact binding must use canonical Maven group and strict version");
  if (JSON.stringify(Object.keys(maven?.modules ?? {}).sort()) !== JSON.stringify([...artifactMavenModules].sort())) problems.push("artifact binding must contain exactly six Maven modules");
  for (const [module, evidence] of Object.entries(maven?.modules ?? {})) {
    if (!artifactMavenModules.includes(module)) problems.push(`unexpected Maven module ${module}`);
    if (!/^[0-9a-f]{64}$/u.test(evidence?.sha256 ?? "")) problems.push(`invalid Maven POM digest for ${module}`);
    if (!/^[0-9a-f]{64}$/u.test(evidence?.signatureSha256 ?? "")) problems.push(`invalid Maven signature digest for ${module}`);
  }
  const files = binding?.files;
  if (JSON.stringify(Object.keys(files ?? {}).sort()) !== JSON.stringify([...requiredArtifactFiles].sort())) problems.push("artifact binding must digest every release-owned coordinate file");
  for (const [path, value] of Object.entries(files ?? {})) if (!requiredArtifactFiles.includes(path) || !/^[0-9a-f]{64}$/u.test(value ?? "")) problems.push(`invalid file digest for ${path}`);
  if (binding?.coordinateDigest !== digest(canonicalArtifactPayload({ npm, maven }))) problems.push("artifact binding coordinateDigest must match canonical npm and Maven coordinates");
  if (binding?.fileDigest !== digest(canonicalFilePayload({ files }))) problems.push("artifact binding fileDigest must match canonical release-owned file digests");
  return problems;
}

export function validateArtifactFileDigests(binding, { repositoryRoot, readFile } = {}) {
  if (!repositoryRoot && !readFile) return [];
  const problems = [];
  for (const path of requiredArtifactFiles) {
    let actual;
    try { actual = digest(readFile ? readFile(path) : readFileSync(join(repositoryRoot, path))); }
    catch { problems.push(`cannot read artifact-bound file ${path}`); continue; }
    if (binding?.files?.[path] !== actual) problems.push(`artifact-bound file digest drifted for ${path}`);
  }
  return problems;
}

export function validateArtifactCoordinateBinding(binding, { policy, readFile } = {}) {
  if (!readFile) return [];
  const problems = [];
  let compatibility;
  let frontend;
  let lockfile;
  let gradle;
  try {
    compatibility = JSON.parse(Buffer.from(readFile("contracts/vireo-package-compatibility.json")).toString("utf8"));
    frontend = JSON.parse(Buffer.from(readFile("frontend/package.json")).toString("utf8"));
    lockfile = JSON.parse(Buffer.from(readFile("frontend/package-lock.json")).toString("utf8"));
    gradle = Buffer.from(readFile("gradle.properties")).toString("utf8");
  } catch {
    return ["cannot read artifact-bound dependency coordinate files"];
  }
  const expectedJvm = policy?.ecosystemRelease?.match(/_jvm-(0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/u)?.[1];
  if (binding?.maven?.version !== expectedJvm)
    problems.push("artifact Maven version must match the release policy JVM coordinate");
  if (!new RegExp(`^starterVersion=${binding?.maven?.version ?? ""}$`, "mu").test(gradle))
    problems.push("gradle.properties starterVersion must match the artifact Maven version");
  for (const name of artifactNpmPackages) {
    const version = binding?.npm?.[name]?.version;
    const allowed = compatibility?.packages?.[name];
    if (!Array.isArray(allowed) || allowed.length !== 1 || allowed[0] !== `^${version}`)
      problems.push(`compatibility contract must bind exactly ${name}@${version}`);
    const frontendRange = frontend?.dependencies?.[name];
    const locked = lockfile?.packages?.[`node_modules/${name}`]?.version;
    if (frontendRange !== undefined) {
      if (frontendRange !== `^${version}`)
        problems.push(`frontend dependency range must match ${name}@${version}`);
      if (locked !== version)
        problems.push(`frontend lockfile must resolve exactly ${name}@${version}`);
      if (lockfile?.packages?.[`node_modules/${name}`]?.integrity !== binding?.npm?.[name]?.integrity)
        problems.push(`frontend lockfile integrity must match ${name}@${version}`);
    } else if (locked !== undefined && locked !== version) {
      problems.push(`frontend lockfile must not resolve a different ${name} version`);
    }
  }
  return problems;
}
