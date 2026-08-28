import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runDoctor } from "./vireo-doctor.mjs";

const root = resolve(import.meta.dirname, "..");
const metadataPath = existsSync(resolve(root, ".vireo/project.json")) ? ".vireo/project.json" : ".vireo/template.json";
const metadata = JSON.parse(readFileSync(resolve(root, metadataPath), "utf8"));
const report = await runDoctor();
if (!report.ok) {
  console.error("Environment checks failed. Run `npm run doctor` for remedies.");
  process.exit(1);
}

const developmentEnv = { ...process.env, SPRING_PROFILES_ACTIVE: "dev" };
if (metadata.database === "postgresql") {
  const databaseName = metadata.databaseName ?? metadata.projectName.replaceAll("-", "_");
  Object.assign(developmentEnv, {
    POSTGRES_DB: databaseName,
    POSTGRES_USER: databaseName,
    POSTGRES_PASSWORD: "vireo_local_only",
    SPRING_DATASOURCE_URL: `jdbc:postgresql://localhost:5432/${databaseName}`,
    SPRING_DATASOURCE_USERNAME: databaseName,
    SPRING_DATASOURCE_PASSWORD: "vireo_local_only",
  });
  const compose = spawnSync("docker", ["compose", "-f", "compose.yaml", "-f", "compose.dev.yaml", "up", "-d", "--wait", "postgres"], { cwd: root, env: developmentEnv, stdio: "inherit" });
  if (compose.status !== 0) process.exit(compose.status ?? 1);
} else {
  Object.assign(developmentEnv, {
    SPRING_DATASOURCE_URL: `jdbc:h2:file:./.data/${metadata.projectName};DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE`,
    SPRING_DATASOURCE_USERNAME: "sa",
    SPRING_DATASOURCE_PASSWORD: "",
  });
}

const children = [
  spawn(process.platform === "win32" ? "gradlew.bat" : "./gradlew", ["bootRun", "--console=plain"], { cwd: root, env: developmentEnv, stdio: "inherit", shell: process.platform === "win32" }),
  spawn("corepack", ["npm", "run", "dev", "--prefix", "frontend"], { cwd: root, env: developmentEnv, stdio: "inherit", shell: process.platform === "win32" }),
];

console.log("Starting Vireo: app http://localhost:3000 · API http://localhost:8080 · demo/demo123");
let stopping = false;
function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
for (const child of children) child.on("exit", code => {
  if (!stopping && code) process.exitCode = code;
  stop();
});
await Promise.all(children.map(child => new Promise(resolveExit => child.once("exit", resolveExit))));
