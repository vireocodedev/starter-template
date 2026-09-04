import { appendFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scopeNames = ["frontend", "jvm", "verification", "deployment", "codeqlJava", "codeqlJavaScript", "dependencyReview", "documentation"];

function matchesSelector(selector = {}, path) {
  if ((selector.excludePaths ?? []).includes(path)) return false;
  return (selector.paths ?? []).includes(path)
    || (selector.pathPrefixes ?? []).some(prefix => path.startsWith(prefix))
    || (selector.extensions ?? []).some(extension => path.endsWith(extension))
    || (selector.patterns ?? []).some(pattern => new RegExp(pattern, "u").test(path));
}

export function validateCiChangePlanPolicy(policy) {
  const problems = [];
  if (policy?.schemaVersion !== 1) problems.push("ci change-plan policy schemaVersion must be 1");
  for (const name of scopeNames) if (!policy?.scopes?.[name]) problems.push(`ci change-plan policy must define ${name}`);
  for (const [name, selector] of Object.entries({ safeNoop: policy?.safeNoop, control: policy?.control, ...policy?.scopes })) {
    if (!selector || typeof selector !== "object") {
      problems.push(`ci change-plan policy ${name} must be an object`);
      continue;
    }
    for (const key of ["paths", "excludePaths", "pathPrefixes", "extensions", "patterns"]) {
      if (selector[key] !== undefined && (!Array.isArray(selector[key]) || !selector[key].every(value => typeof value === "string")))
        problems.push(`ci change-plan policy ${name}.${key} must be an array of strings`);
    }
    for (const pattern of selector.patterns ?? []) {
      try { new RegExp(pattern, "u"); } catch { problems.push(`ci change-plan policy ${name}.patterns contains an invalid regular expression`); }
    }
  }
  return problems;
}

export function planCiChanges(changes, policy) {
  const problems = validateCiChangePlanPolicy(policy);
  if (problems.length) throw new Error(problems.join("\n"));
  const paths = new Set();
  for (const change of changes) {
    if (!change || typeof change.path !== "string" || !change.path) throw new Error("ci change-plan received a change without a path");
    paths.add(change.path);
    if (change.previousPath !== undefined) {
      if (typeof change.previousPath !== "string" || !change.previousPath) throw new Error("ci change-plan received a rename without a previous path");
      paths.add(change.previousPath);
    }
  }
  const plan = Object.fromEntries(scopeNames.map(name => [name, false]));
  const unclassifiedPaths = [];
  let controlTouched = false;
  for (const path of [...paths].sort()) {
    if (matchesSelector(policy.control, path)) {
      for (const name of scopeNames) plan[name] = true;
      controlTouched = true;
      continue;
    }
    if (matchesSelector(policy.safeNoop, path)) continue;
    let matched = false;
    for (const name of scopeNames) {
      if (matchesSelector(policy.scopes[name], path)) { plan[name] = true; matched = true; }
    }
    if (!matched) unclassifiedPaths.push(path);
  }
  if (unclassifiedPaths.length) for (const name of scopeNames) plan[name] = true;
  return { ...plan, full: controlTouched || unclassifiedPaths.length > 0, changedPaths: [...paths].sort(), unclassifiedPaths };
}

export function parseGitNameStatus(buffer) {
  const fields = Buffer.from(buffer).toString("utf8").split("\0");
  fields.pop();
  const changes = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index++];
    if (!status) continue;
    if (/^[RC]/u.test(status)) {
      const previousPath = fields[index++]; const path = fields[index++];
      if (!previousPath || !path) throw new Error("Malformed rename/copy record from git diff");
      changes.push({ status: status[0], previousPath, path });
    } else {
      const path = fields[index++];
      if (!/^[ADMUTX]/u.test(status) || !path) throw new Error(`Malformed status record from git diff: ${status}`);
      changes.push({ status: status[0], path });
    }
  }
  return changes;
}

export function readExactChanges(base, head) {
  for (const revision of [base, head]) {
    const resolved = spawnSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], { cwd: repositoryRoot, encoding: "utf8" });
    if (resolved.status !== 0) throw new Error(`Unable to resolve exact commit ${revision}`);
  }
  const result = spawnSync("git", ["diff", "--find-renames", "--name-status", "-z", base, head], { cwd: repositoryRoot, encoding: "buffer" });
  if (result.status !== 0) throw new Error(result.stderr.toString("utf8") || "Unable to compare exact commits");
  return parseGitNameStatus(result.stdout);
}

function allPlan() { return { ...Object.fromEntries(scopeNames.map(name => [name, true])), full: true, changedPaths: [], unclassifiedPaths: ["forced full verification"] }; }

function parseArguments(arguments_) {
  const options = { all: false, json: false, githubOutput: undefined, base: undefined, head: undefined };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--all") options.all = true;
    else if (argument === "--json") options.json = true;
    else if (["--base", "--head", "--github-output"].includes(argument)) options[argument.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())] = arguments_[++index];
    else throw new Error(`Unknown argument ${argument}`);
  }
  if (!options.all && (!options.base || !options.head)) throw new Error("--base and --head are required unless --all is used");
  if (options.all && (options.base || options.head)) throw new Error("--all cannot be combined with --base or --head");
  return options;
}

export function writeGithubOutput(plan, outputPath) {
  const outputNames = { frontend: "frontend", jvm: "jvm", verification: "verification", deployment: "deployment", codeqlJava: "codeql-java", codeqlJavaScript: "codeql-javascript", dependencyReview: "dependency-review", documentation: "documentation" };
  const lines = scopeNames.map(name => `${outputNames[name]}=${plan[name]}`);
  lines.push(`full=${plan.full}`, `reason=${plan.full ? "unclassified or CI-control paths require every lane" : "only relevant verification lanes are enabled"}`);
  appendFileSync(outputPath, `${lines.join("\n")}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArguments(process.argv.slice(2));
    const policy = JSON.parse(readFileSync(join(repositoryRoot, "contracts/ci-change-plan-policy.json"), "utf8"));
    const plan = options.all ? allPlan() : planCiChanges(readExactChanges(options.base, options.head), policy);
    if (options.githubOutput) writeGithubOutput(plan, options.githubOutput);
    if (options.json || !options.githubOutput) process.stdout.write(`${JSON.stringify(plan)}\n`);
  } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 2; }
}
