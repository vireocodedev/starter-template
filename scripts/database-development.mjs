import { spawnSync } from "node:child_process";

export const DATABASE_MODES = Object.freeze({
  H2: "h2",
  COMPOSE: "compose",
  EXTERNAL: "external",
});

const SUPPORTED_DATABASE_MODES = new Set(Object.values(DATABASE_MODES));
const EXTERNAL_DATASOURCE_VARIABLES = [
  "SPRING_DATASOURCE_URL",
  "SPRING_DATASOURCE_USERNAME",
  "SPRING_DATASOURCE_PASSWORD",
];

function hasValue(environment, name) {
  return (
    typeof environment[name] === "string" && environment[name].trim() !== ""
  );
}

function hasVariable(environment, name) {
  return Object.hasOwn(environment, name) && environment[name] !== undefined;
}

function assignDefault(environment, name, value) {
  if (!hasVariable(environment, name)) environment[name] = value;
}

export function resolveDatabaseMode(metadata, environment = process.env) {
  const requestedMode = environment.VIREO_DATABASE_MODE?.trim().toLowerCase();
  if (requestedMode) {
    if (!SUPPORTED_DATABASE_MODES.has(requestedMode)) {
      throw new Error(
        `Unsupported VIREO_DATABASE_MODE "${requestedMode}"; expected h2, compose, or external.`,
      );
    }
    return requestedMode;
  }

  return metadata.database === "postgresql"
    ? DATABASE_MODES.COMPOSE
    : DATABASE_MODES.H2;
}

export function databaseEnvironment(mode, metadata, source = process.env) {
  const environment = { ...source, SPRING_PROFILES_ACTIVE: "dev" };
  const projectName = metadata.projectName ?? "vireo";

  if (mode === DATABASE_MODES.EXTERNAL) return environment;

  if (mode === DATABASE_MODES.H2) {
    assignDefault(
      environment,
      "SPRING_DATASOURCE_URL",
      `jdbc:h2:file:./.data/${projectName};DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE`,
    );
    assignDefault(environment, "SPRING_DATASOURCE_USERNAME", "sa");
    assignDefault(environment, "SPRING_DATASOURCE_PASSWORD", "");
    return environment;
  }

  if (mode !== DATABASE_MODES.COMPOSE) {
    throw new Error(`Cannot prepare unsupported database mode "${mode}".`);
  }

  const databaseName =
    metadata.databaseName ?? projectName.replaceAll("-", "_");
  const postgresPort = source.POSTGRES_PORT ?? "5432";
  assignDefault(environment, "POSTGRES_DB", databaseName);
  assignDefault(environment, "POSTGRES_OWNER_USER", `${databaseName}_owner`);
  assignDefault(
    environment,
    "POSTGRES_OWNER_PASSWORD",
    "vireo_local_owner_only",
  );
  assignDefault(
    environment,
    "POSTGRES_RUNTIME_USER",
    `${databaseName}_runtime`,
  );
  assignDefault(
    environment,
    "POSTGRES_RUNTIME_PASSWORD",
    "vireo_local_runtime_only",
  );
  assignDefault(
    environment,
    "SPRING_DATASOURCE_URL",
    `jdbc:postgresql://localhost:${postgresPort}/${environment.POSTGRES_DB}`,
  );
  assignDefault(
    environment,
    "SPRING_DATASOURCE_USERNAME",
    environment.POSTGRES_RUNTIME_USER,
  );
  assignDefault(
    environment,
    "SPRING_DATASOURCE_PASSWORD",
    environment.POSTGRES_RUNTIME_PASSWORD,
  );
  assignDefault(
    environment,
    "SPRING_FLYWAY_USER",
    environment.POSTGRES_OWNER_USER,
  );
  assignDefault(
    environment,
    "SPRING_FLYWAY_PASSWORD",
    environment.POSTGRES_OWNER_PASSWORD,
  );
  return environment;
}

export function externalDatasourceProblem(environment = process.env) {
  const missing = EXTERNAL_DATASOURCE_VARIABLES.filter((name) =>
    name === "SPRING_DATASOURCE_PASSWORD"
      ? !hasVariable(environment, name)
      : !hasValue(environment, name),
  );
  return missing.length === 0
    ? null
    : `External datasource mode requires ${missing.join(", ")}.`;
}

function successful(result) {
  return !result.error && result.status === 0;
}

function versionSummary(result, fallback) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  return output.split("\n")[0] || fallback;
}

export function detectComposeCommand(run = spawnSync) {
  const plugin = run("docker", ["compose", "version"], { encoding: "utf8" });
  if (successful(plugin)) {
    return {
      executable: "docker",
      prefixArguments: ["compose"],
      summary: versionSummary(plugin, "Docker Compose plugin"),
    };
  }

  const standalone = run("docker-compose", ["version"], { encoding: "utf8" });
  if (successful(standalone)) {
    return {
      executable: "docker-compose",
      prefixArguments: [],
      summary: versionSummary(standalone, "Docker Compose standalone"),
    };
  }

  return null;
}

export function runCompose(compose, arguments_, options = {}, run = spawnSync) {
  return run(
    compose.executable,
    [...compose.prefixArguments, ...arguments_],
    options,
  );
}
