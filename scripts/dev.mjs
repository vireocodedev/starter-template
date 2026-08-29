import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DATABASE_MODES,
  databaseEnvironment,
  detectComposeCommand,
  externalDatasourceProblem,
  resolveDatabaseMode,
  runCompose,
} from "./database-development.mjs";
import { runDoctor } from "./vireo-doctor.mjs";

const root = resolve(import.meta.dirname, "..");
const metadataPath = existsSync(resolve(root, ".vireo/project.json"))
  ? ".vireo/project.json"
  : ".vireo/template.json";
const metadata = JSON.parse(readFileSync(resolve(root, metadataPath), "utf8"));
const databaseMode = resolveDatabaseMode(metadata);
const report = await runDoctor();
if (!report.ok) {
  console.error(
    "Environment checks failed. Run `npm run doctor` for remedies.",
  );
  process.exit(1);
}

const developmentEnv = databaseEnvironment(databaseMode, metadata);
if (databaseMode === DATABASE_MODES.EXTERNAL) {
  const datasourceProblem = externalDatasourceProblem(developmentEnv);
  if (datasourceProblem) throw new Error(datasourceProblem);
}
if (databaseMode === DATABASE_MODES.COMPOSE) {
  const composeCommand = detectComposeCommand();
  if (!composeCommand) {
    throw new Error(
      "Docker Compose plugin or standalone docker-compose is required.",
    );
  }
  const compose = runCompose(
    composeCommand,
    [
      "-f",
      "compose.yaml",
      "-f",
      "compose.dev.yaml",
      "up",
      "-d",
      "--wait",
      "postgres",
    ],
    { cwd: root, env: developmentEnv, stdio: "inherit" },
  );
  if (compose.status !== 0) process.exit(compose.status ?? 1);
}

const children = [
  spawn(
    process.platform === "win32" ? "gradlew.bat" : "./gradlew",
    ["bootRun", "--console=plain"],
    {
      cwd: root,
      env: developmentEnv,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  ),
  spawn("corepack", ["npm", "run", "dev", "--prefix", "frontend"], {
    cwd: root,
    env: developmentEnv,
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
];

console.log(
  "Starting Vireo: app http://localhost:3000 · API http://localhost:8080 · demo/demo123",
);
let stopping = false;
function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
for (const child of children)
  child.on("exit", (code) => {
    if (!stopping && code) process.exitCode = code;
    stop();
  });
await Promise.all(
  children.map(
    (child) => new Promise((resolveExit) => child.once("exit", resolveExit)),
  ),
);
