import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const jsonMode = process.argv.includes("--json");

function command(name, args = ["--version"]) {
  const completed = spawnSync(name, args, { encoding: "utf8" });
  if (completed.error || completed.status !== 0) return null;
  return `${completed.stdout ?? ""}\n${completed.stderr ?? ""}`.trim();
}

function major(version) {
  return Number(version?.match(/\d+/u)?.[0]);
}

function executableInPath(name) {
  const suffixes = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  return (process.env.PATH ?? "").split(process.platform === "win32" ? ";" : ":").some(directory =>
    suffixes.some(suffix => {
      try { accessSync(resolve(directory, `${name}${suffix}`), constants.X_OK); return true; } catch { return false; }
    }),
  );
}

function javaVersion() {
  const executed = command("java", ["-version"]);
  if (executed) return executed;
  if (!process.env.JAVA_HOME) return null;
  try {
    return readFileSync(resolve(process.env.JAVA_HOME, "release"), "utf8").match(/^JAVA_VERSION="([^"]+)"/mu)?.[1] ?? null;
  } catch { return null; }
}

function checkPort(port) {
  return new Promise(resolveCheck => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.unref();
    socket.setTimeout(500);
    socket.once("connect", () => { socket.destroy(); resolveCheck(false); });
    socket.once("error", () => resolveCheck(true));
    socket.once("timeout", () => { socket.destroy(); resolveCheck(true); });
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function result(code, status, summary, remedy) {
  return { code, status, summary, ...(remedy ? { remedy } : {}) };
}

export async function runDoctor() {
  const results = [];
  const node = process.versions.node;
  results.push(
    major(node) === 24
      ? result("VIR-ENV-001", "pass", `Node ${node}`)
      : result("VIR-ENV-001", "fail", `Node ${node}; Vireo requires Node 24`, "Install Node 24.15 or newer, but below 25."),
  );

  const npm = process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/u)?.[1] ?? command("corepack", ["npm", "--version"]);
  results.push(
    npm === "12.0.2"
      ? result("VIR-ENV-002", "pass", `npm ${npm}`)
      : result("VIR-ENV-002", "fail", `Expected Corepack npm 12.0.2; found ${npm ?? "nothing"}`, "Run `corepack enable` and `corepack prepare npm@12.0.2 --activate`."),
  );

  const java = javaVersion();
  results.push(
    major(java) === 21 || major(java) === 25
      ? result("VIR-ENV-003", "pass", java.split("\n")[0])
      : result("VIR-ENV-003", "fail", `Java 21 or 25 is required; found ${java ?? "nothing"}`, "Install a JDK 21 distribution and set JAVA_HOME."),
  );

  results.push(executableInPath("git") ? result("VIR-ENV-004", "pass", "Git is available") : result("VIR-ENV-004", "warn", "Git is unavailable", "Install Git if you want local version control."));

  const metadataPath = existsSync(resolve(root, ".vireo/project.json")) ? ".vireo/project.json" : ".vireo/template.json";
  let metadata;
  try {
    metadata = readJson(metadataPath);
    results.push(result("VIR-PROJECT-001", "pass", `Valid ${metadataPath}`));
  } catch {
    results.push(result("VIR-PROJECT-001", "fail", "Vireo project metadata is missing or invalid", "Restore `.vireo/project.json`, or rerun the create command into a new directory."));
    metadata = { database: "h2" };
  }

  const frontendInstalled = existsSync(resolve(root, "frontend/node_modules"));
  results.push(frontendInstalled ? result("VIR-DEPS-001", "pass", "Frontend dependencies are installed") : result("VIR-DEPS-001", "fail", "Frontend dependencies are not installed", "Run `npm run setup`."));

  try {
    const frontend = readJson("frontend/package.json");
    const versions = Object.entries(frontend.dependencies)
      .filter(([name]) => name.startsWith("@vireocodedev/"))
      .map(([, version]) => version);
    const aligned = versions.length > 0 && new Set(versions).size === 1;
    results.push(aligned ? result("VIR-DEPS-002", "pass", `Vireo frontend packages align at ${versions[0]}`) : result("VIR-DEPS-002", "fail", "Vireo frontend package versions are not aligned", "Use one compatible Vireo version across every @vireocodedev dependency."));
  } catch {
    results.push(result("VIR-DEPS-002", "fail", "Cannot read frontend/package.json", "Restore the generated manifest."));
  }

  const backendPort = await checkPort(8080);
  const frontendPort = await checkPort(3000);
  results.push(backendPort ? result("VIR-PORT-001", "pass", "Backend port 8080 is available") : result("VIR-PORT-001", "fail", "Backend port 8080 is already in use", "Stop the process using port 8080, then retry."));
  results.push(frontendPort ? result("VIR-PORT-002", "pass", "Frontend port 3000 is available") : result("VIR-PORT-002", "fail", "Frontend port 3000 is already in use", "Stop the process using port 3000, then retry."));

  if (metadata.database === "postgresql") {
    const compose = command("docker", ["compose", "version"]);
    results.push(compose ? result("VIR-DB-001", "pass", compose.split("\n")[0]) : result("VIR-DB-001", "fail", "Docker Compose is required for this PostgreSQL project", "Start Docker Desktop/Engine and ensure `docker compose version` succeeds."));
  } else {
    results.push(result("VIR-DB-001", "pass", "Embedded H2 development database selected"));
  }

  const vitePath = resolve(root, "frontend/vite.config.ts");
  const pwa = existsSync(vitePath) && readFileSync(vitePath, "utf8").includes("VitePWA(");
  results.push(pwa ? result("VIR-PWA-001", "pass", "PWA plugin and generated manifest configuration are present") : result("VIR-PWA-001", "fail", "PWA plugin configuration is missing", "Restore the VitePWA configuration in frontend/vite.config.ts."));

  return { schemaVersion: 1, ok: results.every(entry => entry.status !== "fail"), project: metadata.projectName ?? "unknown", database: metadata.database, results };
}

async function main() {
  const report = await runDoctor();
  if (jsonMode) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Vireo doctor — ${report.project} (${report.database})`);
    for (const entry of report.results) {
      console.log(`${entry.status === "pass" ? "✓" : entry.status === "warn" ? "!" : "✗"} ${entry.code} ${entry.summary}`);
      if (entry.remedy) console.log(`  Remedy: ${entry.remedy}`);
    }
    console.log(report.ok ? "Ready to run." : "Resolve the failed checks above and rerun `npm run doctor`.");
  }
  if (!report.ok) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
