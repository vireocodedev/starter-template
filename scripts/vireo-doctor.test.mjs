import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { resolveDoctorProfile } from "./vireo-doctor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Doctor emits a parseable, schema-complete JSON report even when checks fail", () => {
  const completed = spawnSync(process.execPath, ["scripts/vireo-doctor.mjs", "--json"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_user_agent: "npm/0.0.0 node/v24.0.0 linux x64 workspaces/false",
    },
  });

  assert.notEqual(completed.status, 0, "the forced unsupported npm must fail");
  assert.equal(completed.stderr, "");
  assert.doesNotMatch(completed.stdout, /^\s*(?:Vireo doctor|✓|!|✗)/mu);

  const report = JSON.parse(completed.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.project, "starter-template");
  assert.equal(report.profile, "full-stack");
  assert.equal(report.database, "h2");
  assert.equal(report.databaseMode, "h2");
  assert.ok(Array.isArray(report.results));
  assert.ok(report.results.length > 0);
  assert.equal(report.ok, false);
});

test("Doctor uses an explicit string profile and falls back safely", () => {
  assert.equal(resolveDoctorProfile({ profile: "frontend" }), "frontend");
  for (const profile of [undefined, null, "", 0, {}])
    assert.equal(resolveDoctorProfile({ profile }), "unknown");
});
