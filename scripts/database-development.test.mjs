import assert from "node:assert/strict";
import test from "node:test";
import {
  DATABASE_MODES,
  databaseEnvironment,
  detectComposeCommand,
  externalDatasourceProblem,
  resolveDatabaseMode,
  runCompose,
} from "./database-development.mjs";

const h2Project = { database: "h2", projectName: "sample-app" };
const postgresqlProject = {
  database: "postgresql",
  databaseName: "sample_database",
  projectName: "sample-app",
};

test("mode selection supports explicit values and metadata-compatible defaults", () => {
  assert.equal(resolveDatabaseMode(h2Project, {}), DATABASE_MODES.H2);
  assert.equal(
    resolveDatabaseMode(postgresqlProject, {}),
    DATABASE_MODES.COMPOSE,
  );
  assert.equal(
    resolveDatabaseMode(h2Project, { VIREO_DATABASE_MODE: "external" }),
    DATABASE_MODES.EXTERNAL,
  );
  assert.throws(
    () => resolveDatabaseMode(h2Project, { VIREO_DATABASE_MODE: "native" }),
    /expected h2, compose, or external/u,
  );
});

test("H2 defaults never replace caller-provided datasource credentials", () => {
  const configured = databaseEnvironment(DATABASE_MODES.H2, h2Project, {
    SPRING_DATASOURCE_URL: "jdbc:h2:mem:caller",
    SPRING_DATASOURCE_USERNAME: "caller-user",
    SPRING_DATASOURCE_PASSWORD: "caller-password",
  });

  assert.equal(configured.SPRING_DATASOURCE_URL, "jdbc:h2:mem:caller");
  assert.equal(configured.SPRING_DATASOURCE_USERNAME, "caller-user");
  assert.equal(configured.SPRING_DATASOURCE_PASSWORD, "caller-password");
});

test("managed Compose supplies missing defaults while preserving every caller credential", () => {
  const configured = databaseEnvironment(
    DATABASE_MODES.COMPOSE,
    postgresqlProject,
    {
      POSTGRES_PORT: "55432",
      POSTGRES_DB: "caller_database",
      POSTGRES_OWNER_USER: "caller-owner",
      POSTGRES_OWNER_PASSWORD: "caller-owner-password",
      POSTGRES_RUNTIME_USER: "caller-runtime",
      POSTGRES_RUNTIME_PASSWORD: "caller-runtime-password",
      SPRING_DATASOURCE_URL: "jdbc:postgresql://database.example/caller",
      SPRING_DATASOURCE_USERNAME: "caller-app",
      SPRING_DATASOURCE_PASSWORD: "caller-app-password",
      SPRING_FLYWAY_USER: "caller-migrator",
      SPRING_FLYWAY_PASSWORD: "caller-migrator-password",
    },
  );

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(configured).filter(
        ([name]) => name !== "SPRING_PROFILES_ACTIVE",
      ),
    ),
    {
      POSTGRES_PORT: "55432",
      POSTGRES_DB: "caller_database",
      POSTGRES_OWNER_USER: "caller-owner",
      POSTGRES_OWNER_PASSWORD: "caller-owner-password",
      POSTGRES_RUNTIME_USER: "caller-runtime",
      POSTGRES_RUNTIME_PASSWORD: "caller-runtime-password",
      SPRING_DATASOURCE_URL: "jdbc:postgresql://database.example/caller",
      SPRING_DATASOURCE_USERNAME: "caller-app",
      SPRING_DATASOURCE_PASSWORD: "caller-app-password",
      SPRING_FLYWAY_USER: "caller-migrator",
      SPRING_FLYWAY_PASSWORD: "caller-migrator-password",
    },
  );
});

test("managed Compose defaults align application, migration, and container roles", () => {
  const configured = databaseEnvironment(
    DATABASE_MODES.COMPOSE,
    postgresqlProject,
    { POSTGRES_PORT: "55432" },
  );

  assert.equal(configured.POSTGRES_DB, "sample_database");
  assert.equal(configured.POSTGRES_OWNER_USER, "sample_database_owner");
  assert.equal(configured.POSTGRES_RUNTIME_USER, "sample_database_runtime");
  assert.equal(
    configured.SPRING_DATASOURCE_URL,
    "jdbc:postgresql://localhost:55432/sample_database",
  );
  assert.equal(
    configured.SPRING_DATASOURCE_USERNAME,
    configured.POSTGRES_RUNTIME_USER,
  );
  assert.equal(
    configured.SPRING_DATASOURCE_PASSWORD,
    configured.POSTGRES_RUNTIME_PASSWORD,
  );
  assert.equal(configured.SPRING_FLYWAY_USER, configured.POSTGRES_OWNER_USER);
  assert.equal(
    configured.SPRING_FLYWAY_PASSWORD,
    configured.POSTGRES_OWNER_PASSWORD,
  );
});

test("external mode passes its environment through and validates complete configuration", () => {
  const source = {
    SPRING_DATASOURCE_URL: "jdbc:postgresql://database.example/app",
    SPRING_DATASOURCE_USERNAME: "app",
    SPRING_DATASOURCE_PASSWORD: "",
  };
  const configured = databaseEnvironment(
    DATABASE_MODES.EXTERNAL,
    postgresqlProject,
    source,
  );

  assert.equal(externalDatasourceProblem(configured), null);
  assert.equal(configured.SPRING_DATASOURCE_URL, source.SPRING_DATASOURCE_URL);
  assert.equal(
    configured.SPRING_DATASOURCE_USERNAME,
    source.SPRING_DATASOURCE_USERNAME,
  );
  assert.equal(
    configured.SPRING_DATASOURCE_PASSWORD,
    source.SPRING_DATASOURCE_PASSWORD,
  );
  assert.match(externalDatasourceProblem({}), /SPRING_DATASOURCE_URL/u);
});

test("Compose discovery prefers the plugin and falls back to standalone", () => {
  const pluginCalls = [];
  const plugin = detectComposeCommand((executable, arguments_) => {
    pluginCalls.push([executable, arguments_]);
    return { status: 0, stdout: "Docker Compose version v2.39.2\n" };
  });
  assert.deepEqual(pluginCalls, [["docker", ["compose", "version"]]]);
  assert.equal(plugin.executable, "docker");
  assert.deepEqual(plugin.prefixArguments, ["compose"]);

  const standaloneCalls = [];
  const standalone = detectComposeCommand((executable, arguments_) => {
    standaloneCalls.push([executable, arguments_]);
    return executable === "docker"
      ? { status: 1, stdout: "" }
      : { status: 0, stdout: "docker-compose version 1.29.2\n" };
  });
  assert.deepEqual(standaloneCalls, [
    ["docker", ["compose", "version"]],
    ["docker-compose", ["version"]],
  ]);
  assert.equal(standalone.executable, "docker-compose");
  assert.deepEqual(standalone.prefixArguments, []);

  assert.equal(
    detectComposeCommand(() => ({ status: 1, stdout: "" })),
    null,
  );
});

test("Compose execution reuses the detected launcher shape", () => {
  const calls = [];
  const compose = {
    executable: "docker-compose",
    prefixArguments: [],
  };
  const completed = runCompose(
    compose,
    ["up", "postgres"],
    {
      cwd: "/project",
    },
    (executable, arguments_, options) => {
      calls.push({ executable, arguments_, options });
      return { status: 0 };
    },
  );

  assert.equal(completed.status, 0);
  assert.deepEqual(calls, [
    {
      executable: "docker-compose",
      arguments_: ["up", "postgres"],
      options: { cwd: "/project" },
    },
  ]);
});
