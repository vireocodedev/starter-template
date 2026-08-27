import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(
  readFileSync(
    join(repositoryRoot, "contracts", "container-context-policy.json"),
    "utf8",
  ),
);
const problems = [];
const results = [];

function filesUnder(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

for (const [name, context] of Object.entries(policy.contexts)) {
  const contextRoot = join(repositoryRoot, context.root);
  const expectedIgnore = `${context.dockerignore.join("\n")}\n`;
  const ignorePath = join(contextRoot, ".dockerignore");
  if (
    !existsSync(ignorePath) ||
    readFileSync(ignorePath, "utf8") !== expectedIgnore
  ) {
    problems.push(
      `${name} .dockerignore must retain its reviewed build-context allowlist`,
    );
  }

  const dockerfilePath = join(contextRoot, "Dockerfile");
  if (
    !existsSync(dockerfilePath) ||
    !readFileSync(dockerfilePath, "utf8").startsWith(
      `FROM ${context.baseImage}\n`,
    )
  ) {
    problems.push(`${name} Dockerfile must pin ${context.baseImage}`);
  }

  const includedPaths = [];
  for (const relativePath of context.requiredFiles) {
    const path = join(contextRoot, relativePath);
    if (!existsSync(path))
      problems.push(
        `${name} required context file is missing: ${relativePath}`,
      );
    else includedPaths.push(path);
  }
  for (const tree of context.requiredTrees) {
    const treePath = join(contextRoot, tree);
    if (!existsSync(treePath))
      problems.push(`${name} required context tree is missing: ${tree}`);
    else includedPaths.push(...filesUnder(treePath));
  }

  const totalBytes = includedPaths.reduce(
    (total, path) => total + statSync(path).size,
    0,
  );
  if (totalBytes > context.maximumBytes) {
    problems.push(
      `${name} context is ${totalBytes} bytes; budget is ${context.maximumBytes} bytes`,
    );
  }
  results.push(
    `${name} ${(totalBytes / 1024 / 1024).toFixed(1)} MiB/${(context.maximumBytes / 1024 / 1024).toFixed(0)} MiB`,
  );
}

const compose = readFileSync(join(repositoryRoot, "compose.yaml"), "utf8");
for (const [service, image] of Object.entries(policy.composeImages)) {
  if (!compose.includes(`  ${service}:\n    image: ${image}\n`)) {
    problems.push(`Compose service ${service} must pin ${image}`);
  }
}

if (problems.length > 0) {
  console.error("Container context policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Container context policy passed: ${results.join(", ")}.`);
