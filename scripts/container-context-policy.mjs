import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(
  readFileSync(
    join(repositoryRoot, "contracts", "container-context-policy.json"),
    "utf8",
  ),
);
const expectedIgnore = `*
!Dockerfile
!build/
build/*
!build/libs/
build/libs/*
!build/libs/app.jar
`;
const actualIgnore = readFileSync(
  join(repositoryRoot, ".dockerignore"),
  "utf8",
);
const problems = [];

if (actualIgnore !== expectedIgnore) {
  problems.push(
    ".dockerignore must retain the reviewed allowlist for Dockerfile and build/libs/app.jar",
  );
}

let totalBytes = 0;
for (const relativePath of policy.includedFiles) {
  const path = join(repositoryRoot, relativePath);
  if (!existsSync(path))
    problems.push(
      `required container-context file is missing: ${relativePath}`,
    );
  else totalBytes += statSync(path).size;
}
if (totalBytes > policy.maximumBytes) {
  problems.push(
    `container context is ${totalBytes} bytes; budget is ${policy.maximumBytes} bytes`,
  );
}

if (problems.length > 0) {
  console.error("Container context policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Container context policy passed: ${policy.includedFiles.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB of ${(policy.maximumBytes / 1024 / 1024).toFixed(0)} MiB.`,
);
