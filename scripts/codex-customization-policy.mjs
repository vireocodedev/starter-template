import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const obsoleteCoordinates = ["@vireocodedev/starter-ui"];
const absoluteLocalPath = /(?:^|[\s"'`])(?:\/(?:home|Users|tmp)\/|[A-Za-z]:[\\/])/u;

function walkSkills(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkSkills(path));
    else if (entry.isFile() && entry.name === "SKILL.md") result.push(path);
  }
  return result;
}

function quotedYamlString(contents, key) {
  return contents.match(new RegExp(`^\\s*${key}:\\s*"(.+)"\\s*$`, "mu"))?.[1];
}

function validateSkill(path, names, problems) {
  const contents = readFileSync(path, "utf8");
  const header = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/u)?.[1];
  const name = header?.match(/^name:\s*([a-z0-9-]+)\s*$/mu)?.[1];
  const description = header?.match(/^description:\s*(\S[\s\S]*)$/mu)?.[1]?.trim();
  if (!header || !name || !description) problems.push(`${path}: complete skill frontmatter is required`);
  else if (names.has(name)) problems.push(`${path}: duplicate skill name ${name} (also ${names.get(name)})`);
  else names.set(name, path);
  if (description && (!/\buse for\b/iu.test(description) || !/\bnot\b/iu.test(description)))
    problems.push(`${path}: description must state both a positive use case and a non-trigger boundary`);

  const metadata = join(dirname(path), "agents", "openai.yaml");
  const yaml = existsSync(metadata) ? readFileSync(metadata, "utf8") : "";
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (!quotedYamlString(yaml, key)) problems.push(`${metadata}: ${key} must be a quoted interface string`);
  }
  if (name && !quotedYamlString(yaml, "default_prompt")?.includes(`$${name}`))
    problems.push(`${metadata}: default_prompt must mention $${name}`);
  if (obsoleteCoordinates.some(coordinate => contents.includes(coordinate)))
    problems.push(`${path}: obsolete Vireo package coordinate`);
  if (absoluteLocalPath.test(contents)) problems.push(`${path}: must not contain an absolute local path`);
  for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)) {
    const target = match[1].trim().replace(/^<|>$/gu, "");
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/iu.test(target)) continue;
    const localTarget = target.split(/[?#]/u, 1)[0];
    if (localTarget && !existsSync(resolve(dirname(path), localTarget)))
      problems.push(`${path}: relative link ${target} does not resolve`);
  }
}

const root = resolve(process.cwd());
const names = new Map();
const problems = [];
for (const skillRoot of [join(root, ".agents", "skills"), join(root, ".vireo", "application", ".agents", "skills")]) {
  for (const path of walkSkills(skillRoot)) validateSkill(path, names, problems);
}
if (problems.length > 0) {
  console.error("Codex customization policy failed:");
  for (const problem of problems) console.error(`- ${relative(root, problem) || problem}`);
  process.exitCode = 1;
} else console.log("Codex customization policy passed.");
