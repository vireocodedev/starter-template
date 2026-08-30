import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  DATABASE_MODES,
  detectComposeCommand,
  externalDatasourceProblem,
  resolveDatabaseMode,
} from "./database-development.mjs";
import { evaluateVireoPackageCompatibility } from "./vireo-package-compatibility.mjs";
import { inspectVerificationHost } from "./verification-host.mjs";
import { checkPwaSourceContract } from "../frontend/scripts/pwa-contract.mjs";

const root = resolve(import.meta.dirname, "..");
const jsonMode = process.argv.includes("--json");

const environmentFile = resolve(root, ".env");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

function command(name, args = ["--version"]) {
  const completed = spawnSync(name, args, { encoding: "utf8" });
  if (completed.error || completed.status !== 0) return null;
  return `${completed.stdout ?? ""}\n${completed.stderr ?? ""}`.trim();
}

function major(version) {
  return Number(version?.match(/\d+/u)?.[0]);
}

function executableInPath(name) {
  const suffixes =
    process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  return (process.env.PATH ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .some((directory) =>
      suffixes.some((suffix) => {
        try {
          accessSync(resolve(directory, `${name}${suffix}`), constants.X_OK);
          return true;
        } catch {
          return false;
        }
      }),
    );
}

function javaVersion() {
  const executed = command("java", ["-version"]);
  if (executed) return executed;
  if (!process.env.JAVA_HOME) return null;
  try {
    return (
      readFileSync(resolve(process.env.JAVA_HOME, "release"), "utf8").match(
        /^JAVA_VERSION="([^"]+)"/mu,
      )?.[1] ?? null
    );
  } catch {
    return null;
  }
}

function checkPort(port) {
  return new Promise((resolveCheck) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.unref();
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolveCheck(false);
    });
    socket.once("error", () => resolveCheck(true));
    socket.once("timeout", () => {
      socket.destroy();
      resolveCheck(true);
    });
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
      : result(
          "VIR-ENV-001",
          "fail",
          `Node ${node}; Vireo requires Node 24`,
          "Install Node 24.15 or newer, but below 25.",
        ),
  );

  const npm =
    process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/u)?.[1] ??
    command("corepack", ["npm", "--version"]);
  results.push(
    npm === "12.0.2"
      ? result("VIR-ENV-002", "pass", `npm ${npm}`)
      : result(
          "VIR-ENV-002",
          "fail",
          `Expected Corepack npm 12.0.2; found ${npm ?? "nothing"}`,
          "Run `corepack enable` and `corepack prepare npm@12.0.2 --activate`.",
        ),
  );

  const java = javaVersion();
  results.push(
    major(java) === 21 || major(java) === 25
      ? result("VIR-ENV-003", "pass", java.split("\n")[0])
      : result(
          "VIR-ENV-003",
          "fail",
          `Java 21 or 25 is required; found ${java ?? "nothing"}`,
          "Install a JDK 21 distribution and set JAVA_HOME.",
        ),
  );

  results.push(
    executableInPath("git")
      ? result("VIR-ENV-004", "pass", "Git is available")
      : result(
          "VIR-ENV-004",
          "warn",
          "Git is unavailable",
          "Install Git if you want local version control.",
        ),
  );

  const verificationHost = inspectVerificationHost();
  results.push(
    result(
      "VIR-VERIFY-001",
      verificationHost.status,
      verificationHost.summary,
      verificationHost.remedy,
    ),
  );

  const metadataPath = existsSync(resolve(root, ".vireo/project.json"))
    ? ".vireo/project.json"
    : ".vireo/template.json";
  let metadata;
  try {
    metadata = readJson(metadataPath);
    results.push(result("VIR-PROJECT-001", "pass", `Valid ${metadataPath}`));
  } catch {
    results.push(
      result(
        "VIR-PROJECT-001",
        "fail",
        "Vireo project metadata is missing or invalid",
        "Restore `.vireo/project.json`, or rerun the create command into a new directory.",
      ),
    );
    metadata = { database: "h2" };
  }

  const frontendInstalled = existsSync(resolve(root, "frontend/node_modules"));
  results.push(
    frontendInstalled
      ? result("VIR-DEPS-001", "pass", "Frontend dependencies are installed")
      : result(
          "VIR-DEPS-001",
          "fail",
          "Frontend dependencies are not installed",
          "Run `npm run setup`.",
        ),
  );

  try {
    const frontend = readJson("frontend/package.json");
    const contract = readJson("contracts/vireo-package-compatibility.json");
    const compatibility = evaluateVireoPackageCompatibility(
      frontend.dependencies,
      contract,
    );
    results.push(
      compatibility.compatible
        ? result(
            "VIR-DEPS-002",
            "pass",
            `Vireo frontend packages match ${contract.id}`,
          )
        : result(
            "VIR-DEPS-002",
            "fail",
            compatibility.problems.join(" "),
            "Use package declarations admitted by contracts/vireo-package-compatibility.json.",
          ),
    );
  } catch {
    results.push(
      result(
        "VIR-DEPS-002",
        "fail",
        "Cannot read the frontend manifest or Vireo compatibility contract",
        "Restore frontend/package.json and contracts/vireo-package-compatibility.json.",
      ),
    );
  }

  const backendPort = await checkPort(8080);
  const frontendPort = await checkPort(3000);
  results.push(
    backendPort
      ? result("VIR-PORT-001", "pass", "Backend port 8080 is available")
      : result(
          "VIR-PORT-001",
          "fail",
          "Backend port 8080 is already in use",
          "Stop the process using port 8080, then retry.",
        ),
  );
  results.push(
    frontendPort
      ? result("VIR-PORT-002", "pass", "Frontend port 3000 is available")
      : result(
          "VIR-PORT-002",
          "fail",
          "Frontend port 3000 is already in use",
          "Stop the process using port 3000, then retry.",
        ),
  );

  let databaseMode;
  try {
    databaseMode = resolveDatabaseMode(metadata);
  } catch (error) {
    results.push(
      result(
        "VIR-DB-001",
        "fail",
        error.message,
        "Set VIREO_DATABASE_MODE to h2, compose, or external.",
      ),
    );
  }

  if (databaseMode === DATABASE_MODES.COMPOSE) {
    const compose = detectComposeCommand();
    results.push(
      compose
        ? result("VIR-DB-001", "pass", `Managed Compose: ${compose.summary}`)
        : result(
            "VIR-DB-001",
            "fail",
            "Managed Compose mode cannot find a Compose launcher",
            "Start Docker and install either the `docker compose` plugin or standalone `docker-compose`.",
          ),
    );
  } else if (databaseMode === DATABASE_MODES.EXTERNAL) {
    const datasourceProblem = externalDatasourceProblem();
    results.push(
      datasourceProblem
        ? result(
            "VIR-DB-001",
            "fail",
            datasourceProblem,
            "Export the complete SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, and SPRING_DATASOURCE_PASSWORD configuration.",
          )
        : result(
            "VIR-DB-001",
            "pass",
            "External datasource configuration is present",
          ),
    );
  } else if (databaseMode === DATABASE_MODES.H2) {
    results.push(result("VIR-DB-001", "pass", "H2 development mode selected"));
  }

  const pwaProblems = checkPwaSourceContract({
    frontendRoot: resolve(root, "frontend"),
    requireNginx: metadata.profile !== "frontend",
  });
  results.push(
    pwaProblems.length === 0
      ? result(
          "VIR-PWA-001",
          "pass",
          "PWA source policy, icons, and deployment configuration are valid",
        )
      : result(
          "VIR-PWA-001",
          "fail",
          pwaProblems[0],
          "Run `corepack npm run pwa:check:source` from frontend and restore the shared PWA policy.",
        ),
  );

  return {
    schemaVersion: 1,
    ok: results.every((entry) => entry.status !== "fail"),
    project: metadata.projectName ?? "unknown",
    database: metadata.database,
    databaseMode: databaseMode ?? "invalid",
    results,
  };
}

async function main() {
  const report = await runDoctor();
  if (jsonMode) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Vireo doctor — ${report.project} (${report.databaseMode})`);
    for (const entry of report.results) {
      console.log(
        `${entry.status === "pass" ? "✓" : entry.status === "warn" ? "!" : "✗"} ${entry.code} ${entry.summary}`,
      );
      if (entry.remedy) console.log(`  Remedy: ${entry.remedy}`);
    }
    console.log(
      report.ok
        ? report.results.some((entry) => entry.status === "warn")
          ? "Ready for development with warnings; supported release evidence still requires the host noted above."
          : "Ready to run."
        : "Resolve the failed checks above and rerun `npm run doctor`.",
    );
  }
  if (!report.ok) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
