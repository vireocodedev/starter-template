import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { hostEnvironmentContractProblems } from "./flagship-demo-policy.mjs";

const root = resolve(import.meta.dirname, "..");
const helper = join(root, "scripts/compose-database-contract.sh");
const deploy = join(root, "deploy/hetzner/deploy.sh");

function writeEnvironment(contents) {
  const directory = mkdtempSync(join(tmpdir(), "vireo-db-contract-"));
  const environmentFile = join(directory, ".env");
  writeFileSync(environmentFile, contents, { mode: 0o600 });
  chmodSync(environmentFile, 0o600);
  return environmentFile;
}

function resolveDatabaseContract(environmentFile) {
  return spawnSync(
    "bash",
    [
      "-c",
      'set -e; source "$1"; VIREO_DATABASE_ENV_FILE="$2"; resolve_compose_database_contract; printf "%s\\n%s\\n" "$VIREO_DATABASE_NAME" "$VIREO_DATABASE_OWNER_USER"',
      "bash",
      helper,
      environmentFile,
    ],
    { cwd: root, encoding: "utf8" },
  );
}

function selectedEnvironmentFile(environmentFile) {
  return spawnSync(
    "bash",
    [
      "-c",
      'source "$1"; VIREO_DATABASE_ENV_FILE="$2"; select_compose_database_environment; printf "%s\\n" "$VIREO_DATABASE_ENV_FILE_RESOLVED"',
      "bash",
      helper,
      environmentFile,
    ],
    { cwd: root, encoding: "utf8" },
  );
}

function resolveDefaultDatabaseContract() {
  const emptyDirectory = mkdtempSync(join(tmpdir(), "vireo-db-contract-empty-"));
  return spawnSync(
    "bash",
    [
      "-c",
      'set -e; source "$1"; cd "$2"; resolve_compose_database_contract; printf "%s\\n%s\\n" "$VIREO_DATABASE_NAME" "$VIREO_DATABASE_OWNER_USER"',
      "bash",
      helper,
      emptyDirectory,
    ],
    { cwd: root, encoding: "utf8" },
  );
}

const splitEnvironment = [
  "POSTGRES_DB=vireo_demo",
  "POSTGRES_OWNER_USER=vireo_owner",
  "POSTGRES_OWNER_PASSWORD=owner-secret-A",
  "POSTGRES_RUNTIME_USER=vireo_runtime",
  "POSTGRES_RUNTIME_PASSWORD=runtime-secret-B",
].join("\n");

test("backup and restore resolve the current split database contract from an explicit env file", () => {
  const result = resolveDatabaseContract(writeEnvironment(splitEnvironment));

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "vireo_demo\nvireo_owner\n");
});

test("backup and restore forward the selected explicit env file to Compose", () => {
  const environmentFile = writeEnvironment(splitEnvironment);
  const result = selectedEnvironmentFile(environmentFile);
  const backup = readFileSync(join(root, "scripts/db-backup.sh"), "utf8");
  const restore = readFileSync(join(root, "scripts/db-restore.sh"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `${environmentFile}\n`);
  for (const script of [backup, restore]) {
    assert.ok(
      script.indexOf('compose_command+=(--env-file "$VIREO_DATABASE_ENV_FILE_RESOLVED")') <
        script.indexOf("compose_command+=(--project-name"),
    );
  }
});

test("a selected database env file must define the split owner identity", () => {
  const result = resolveDatabaseContract(
    writeEnvironment("POSTGRES_DB=vireo_demo\nPOSTGRES_PASSWORD=opaque-secret"),
  );

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Selected database environment file must define POSTGRES_DB and POSTGRES_OWNER_USER/u,
  );
  assert.doesNotMatch(result.stderr, /opaque-secret/u);
});

test("without an env file, database helpers retain canonical defaults", () => {
  const result = resolveDefaultDatabaseContract();

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "starter_template\nstarter_template_owner\n");
});

test("database environment parsing rejects duplicate assignments without exposing values", () => {
  const result = resolveDatabaseContract(
    writeEnvironment(
      ["POSTGRES_DB=first", "POSTGRES_DB=second", "TOKEN=never-print-me"].join(
        "\n",
      ),
    ),
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Duplicate environment key POSTGRES_DB/u);
  assert.doesNotMatch(result.stderr, /never-print-me/u);
});

function deployEnvironment(overrides) {
  return Object.entries({
    POSTGRES_DB: "vireo_demo",
    POSTGRES_OWNER_USER: "vireo_owner",
    POSTGRES_OWNER_PASSWORD: "owner-secret-A",
    POSTGRES_RUNTIME_USER: "vireo_runtime",
    POSTGRES_RUNTIME_PASSWORD: "runtime-secret-B",
    SESSION_COOKIE_SECURE: "true",
    FRONTEND_PORT: "3000",
    ...overrides,
  })
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function runDeploy(environmentFile, inheritedEnvironment = {}) {
  return spawnSync("bash", [deploy], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      VIREO_DEMO_COMPOSE_PROJECT: "vireo-contract-test",
      VIREO_DEMO_ENV_FILE: environmentFile,
      ...inheritedEnvironment,
    },
  });
}

test("deployment rejects equal owner and runtime usernames before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(
      deployEnvironment({ POSTGRES_RUNTIME_USER: "VIREO_OWNER" }),
    ),
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /POSTGRES_OWNER_USER and POSTGRES_RUNTIME_USER must differ/u);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment rejects equal database secrets before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(
      deployEnvironment({ POSTGRES_RUNTIME_PASSWORD: "owner-secret-A" }),
    ),
  );

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /POSTGRES_OWNER_PASSWORD and POSTGRES_RUNTIME_PASSWORD must differ/u,
  );
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment rejects an unchanged placeholder secret before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(
      deployEnvironment({
        POSTGRES_OWNER_PASSWORD: "replace-with-a-long-random-owner-secret",
      }),
    ),
  );

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /POSTGRES_OWNER_PASSWORD must be set to a non-placeholder value/u,
  );
  assert.doesNotMatch(
    `${result.stdout}${result.stderr}`,
    /replace-with-a-long-random-owner-secret/u,
  );
});

test("deployment rejects inherited database overrides before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(deployEnvironment({})),
    { POSTGRES_RUNTIME_PASSWORD: "owner-secret-A" },
  );

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /Unset inherited POSTGRES_RUNTIME_PASSWORD so the deployment environment file remains authoritative/u,
  );
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment rejects quoted values before Compose can reinterpret them", () => {
  const result = runDeploy(
    writeEnvironment(
      deployEnvironment({ POSTGRES_RUNTIME_PASSWORD: '"owner-secret-A"' }),
    ),
  );

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /POSTGRES_RUNTIME_PASSWORD must use an unquoted, uninterpolated literal value/u,
  );
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment rejects an inherited session-cookie override before Compose starts", () => {
  const result = runDeploy(writeEnvironment(deployEnvironment({})), {
    SESSION_COOKIE_SECURE: "false",
  });

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /Unset inherited SESSION_COOKIE_SECURE so the deployment environment file remains authoritative/u,
  );
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment requires a secure session cookie before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(deployEnvironment({ SESSION_COOKIE_SECURE: "false" })),
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /SESSION_COOKIE_SECURE must be true for deployment/u);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /owner-secret-A/u);
});

test("deployment rejects legacy single-identity keys before Compose starts", () => {
  const result = runDeploy(
    writeEnvironment(deployEnvironment({ POSTGRES_USER: "legacy_owner" })),
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Legacy POSTGRES_USER\/POSTGRES_PASSWORD is not supported/u);
});

test("policy rejects a legacy identity and equal split credentials in template fixtures", () => {
  const problems = hostEnvironmentContractProblems(
    [
      "POSTGRES_OWNER_USER=VIREO_OWNER",
      "POSTGRES_OWNER_PASSWORD=shared-secret",
      "POSTGRES_RUNTIME_USER=vireo_owner",
      "POSTGRES_RUNTIME_PASSWORD=shared-secret",
      "SESSION_COOKIE_SECURE=true",
      "POSTGRES_USER=legacy_owner",
    ].join("\n"),
  );

  assert.deepEqual(problems, [
    "the host environment template must not use the legacy single database identity",
    "the host environment template must use distinct owner and runtime database users",
    "the host environment template must use distinct owner and runtime database secrets",
  ]);
  assert.doesNotMatch(problems.join("\n"), /shared-secret/u);
});
