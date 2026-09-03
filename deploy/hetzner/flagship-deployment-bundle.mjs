/**
 * The release runner creates, and the host verifies, the same small deployment
 * bundle.  Keeping this code in deploy/hetzner makes it maintainer-only: it is
 * deliberately not part of the generated application contract.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

export const bundleSchemaVersion = 1;
export const maxBundleBytes = 180 * 1024 * 1024;
export const maxExpandedBundleBytes = 512 * 1024 * 1024;
export const allowedLiteralMembers = new Set([
  "Dockerfile",
  "compose.yaml",
  "compose.demo.yaml",
  "deploy/backend-healthcheck.sh",
  "deploy/postgres/init-runtime-role.sh",
  "frontend/Dockerfile",
  "frontend/nginx.conf",
]);
export const allowedPrefixes = ["build/libs/", "frontend/dist/"];
export const allowedDirectories = new Set(["build", "build/libs", "frontend", "frontend/dist"]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const text = (value) => Buffer.from(value).toString("utf8").replace(/\0.*$/u, "");
const octal = (value) => {
  const normalized = text(value).trim();
  return normalized ? Number.parseInt(normalized, 8) : 0;
};
const isSafeMember = (member) =>
  typeof member === "string" &&
  member.length > 0 &&
  member.length <= 240 &&
  !member.startsWith("/") &&
  !member.split("/").some((part) => !part || part === "." || part === "..");

export function isAllowedMember(member) {
  return allowedLiteralMembers.has(member) || allowedPrefixes.some((prefix) => member.startsWith(prefix));
}

function isAllowedDirectory(member) {
  // GNU tar writes every Vite output directory.  Keep the authority narrow:
  // only exact parent directories or descendants of a file-allowlisted prefix
  // may be directories; adjacent frontend/build paths remain forbidden.
  return allowedDirectories.has(member) || allowedPrefixes.some((prefix) => member.startsWith(prefix));
}

/** Parse a ustar stream without extracting it. Links, special files and PAX
 * extensions are rejected instead of interpreted. */
export function readDeploymentArchive(archive) {
  const compressed = Buffer.isBuffer(archive) ? archive : readFileSync(archive);
  if (compressed.length > maxBundleBytes) throw new Error("deployment archive exceeds the policy size limit");
  const raw = gunzipSync(compressed, { maxOutputLength: maxExpandedBundleBytes });
  if (raw.length > maxExpandedBundleBytes) throw new Error("deployment archive expands beyond the policy size limit");
  const members = [];
  let offset = 0;
  while (offset + 512 <= raw.length) {
    const header = raw.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = text(header.subarray(0, 100));
    const prefix = text(header.subarray(345, 500));
    const memberRaw = prefix ? `${prefix}/${name}` : name;
    const size = octal(header.subarray(124, 136));
    const type = text(header.subarray(156, 157)) || "0";
    if (!Number.isSafeInteger(size) || size < 0) throw new Error("deployment archive contains an invalid member size");
    const payloadStart = offset + 512;
    const payloadEnd = payloadStart + size;
    if (payloadEnd > raw.length) throw new Error("deployment archive member exceeds archive length");
    if (type === "5") {
      const member = memberRaw.replace(/\/+$/u, "");
      if (!isSafeMember(member) || !isAllowedDirectory(member))
        throw new Error(`deployment archive rejects directory ${member}`);
    } else if (type === "0" || type === "") {
      const member = memberRaw;
      members.push({ path: member, size, sha256: sha256(raw.subarray(payloadStart, payloadEnd)), type: "file" });
    } else {
      throw new Error(`deployment archive rejects non-regular member ${memberRaw}`);
    }
    offset = payloadStart + Math.ceil(size / 512) * 512;
  }
  if (offset === 0) throw new Error("deployment archive is empty");
  return members;
}

export function validateDeploymentManifest(manifest, { archive, expected = {} } = {}) {
  const problems = [];
  if (manifest?.schemaVersion !== bundleSchemaVersion) problems.push("bundle schemaVersion must equal 1");
  for (const key of ["repository", "tag", "commit", "release", "runId", "runAttempt", "transaction", "dataClassification", "archiveSha256", "members"]) {
    if (manifest?.[key] === undefined) problems.push(`bundle manifest is missing ${key}`);
  }
  if (!/^[\w.-]+\/[\w.-]+$/u.test(manifest?.repository ?? "")) problems.push("bundle repository is malformed");
  if (!/^starter-template@\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/u.test(manifest?.tag ?? "")) problems.push("bundle tag is malformed");
  if (!/^[0-9a-f]{40}$/u.test(manifest?.commit ?? "")) problems.push("bundle commit is malformed");
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/releases\/tag\/starter-template%40/u.test(manifest?.release ?? "")) problems.push("bundle release URL is malformed");
  if (!/^\d+$/u.test(String(manifest?.runId ?? "")) || !/^\d+$/u.test(String(manifest?.runAttempt ?? ""))) problems.push("bundle run identity is malformed");
  if (!/^[0-9a-f]{64}$/u.test(manifest?.transaction ?? "")) problems.push("bundle transaction is malformed");
  if (manifest?.dataClassification !== "public-synthetic-only") problems.push("bundle must be public-synthetic-only");
  if (!/^[0-9a-f]{64}$/u.test(manifest?.archiveSha256 ?? "")) problems.push("bundle archive digest is malformed");
  for (const [key, value] of Object.entries(expected)) if (value !== undefined && manifest?.[key] !== value) problems.push(`bundle ${key} does not match the authorized release`);
  let members = [];
  try { members = archive ? readDeploymentArchive(archive) : manifest?.members; } catch (error) { problems.push(error.message); }
  if (!Array.isArray(manifest?.members) || !Array.isArray(members)) problems.push("bundle members must be an array");
  const manifestMembers = new Map();
  for (const member of manifest?.members ?? []) {
    if (!isSafeMember(member?.path) || !isAllowedMember(member.path)) problems.push(`bundle member is not allowlisted: ${member?.path ?? "unknown"}`);
    if (!Number.isSafeInteger(member?.size) || member.size < 0 || !/^[0-9a-f]{64}$/u.test(member?.sha256 ?? "")) problems.push(`bundle member is malformed: ${member?.path ?? "unknown"}`);
    if (manifestMembers.has(member?.path)) problems.push(`bundle member is duplicated: ${member?.path}`);
    manifestMembers.set(member?.path, member);
  }
  const archiveMembers = new Map();
  for (const member of members ?? []) {
    if (!isSafeMember(member.path) || !isAllowedMember(member.path)) problems.push(`archive member is not allowlisted: ${member.path}`);
    if (archiveMembers.has(member.path)) problems.push(`archive member is duplicated: ${member.path}`);
    archiveMembers.set(member.path, member);
  }
  for (const required of ["Dockerfile", "compose.yaml", "compose.demo.yaml", "build/libs/app.jar", "deploy/backend-healthcheck.sh", "frontend/Dockerfile", "frontend/nginx.conf", "frontend/dist/index.html", "deploy/postgres/init-runtime-role.sh"]) if (!archiveMembers.has(required)) problems.push(`archive is missing required member ${required}`);
  if (manifestMembers.size !== archiveMembers.size) problems.push("bundle manifest member count does not match archive");
  for (const [path, member] of archiveMembers) {
    const declared = manifestMembers.get(path);
    if (!declared || declared.size !== member.size || declared.sha256 !== member.sha256) problems.push(`bundle manifest does not bind archive member ${path}`);
  }
  if (archive && manifest?.archiveSha256 !== sha256(Buffer.isBuffer(archive) ? archive : readFileSync(archive))) problems.push("bundle archive digest does not match manifest");
  return problems;
}

function cli() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "manifest") {
    const [archive, output, repository, tag, commit, release, runId, runAttempt] = args;
    const members = readDeploymentArchive(archive);
    // Run identity is evidence, not deployment identity. A rerun of an exact
    // immutable archive must no-op instead of creating a second release slot.
    const transaction = sha256(`${repository}\n${tag}\n${commit}\n${release}\n${sha256(readFileSync(archive))}`);
    const manifest = { schemaVersion: bundleSchemaVersion, repository, tag, commit, release, runId: String(runId), runAttempt: String(runAttempt), transaction, dataClassification: "public-synthetic-only", archiveSha256: sha256(readFileSync(archive)), members };
    const problems = validateDeploymentManifest(manifest, { archive });
    if (problems.length) throw new Error(problems.join("; "));
    writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }
  if (command === "validate") {
    const [archive, manifestFile, repository, tag, commit, release] = args;
    const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    const problems = validateDeploymentManifest(manifest, { archive, expected: { repository, tag, commit, release } });
    if (problems.length) throw new Error(problems.join("; "));
    process.stdout.write(`${manifest.transaction}\n`);
    return;
  }
  throw new Error(`usage: ${basename(process.argv[1])} manifest|validate ...`);
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try { cli(); } catch (error) { console.error(error.message); process.exitCode = 2; }
}
