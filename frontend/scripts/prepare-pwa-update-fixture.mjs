import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { checkPwaBuiltContract, checkPwaSourceContract, formatPwaContractProblems } from "./pwa-contract.mjs";
import {
  PWA_UPDATE_FIXTURE_ROOT,
  PWA_UPDATE_REVISIONS,
  pwaUpdateRevisionPath,
  selectPwaFixtureRevision,
} from "./pwa-update-fixture.mjs";

const frontendRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(frontendRoot, "dist");

function assertPwaContract(problems) {
  if (problems.length > 0) throw new Error(`PWA fixture contract failed:\n${formatPwaContractProblems(problems)}`);
}

function run(command, args, environment) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: frontendRoot,
      env: environment,
      stdio: "inherit",
    });
    child.once("error", rejectRun);
    child.once("exit", code => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} ${args.join(" ")} exited with ${code ?? "an unknown status"}`));
    });
  });
}

async function buildRevision(revision) {
  await run("corepack", ["npm", "run", "build"], { ...process.env, VIREO_BUILD_REVISION: revision });
  assertPwaContract(checkPwaBuiltContract({ frontendRoot, distRoot }));
  await cp(distRoot, pwaUpdateRevisionPath(revision), { recursive: true });
}

assertPwaContract(checkPwaSourceContract({ frontendRoot, requireNginx: true }));
await rm(PWA_UPDATE_FIXTURE_ROOT, { force: true, recursive: true });
await mkdir(PWA_UPDATE_FIXTURE_ROOT, { recursive: true });
for (const revision of Object.keys(PWA_UPDATE_REVISIONS)) {
  await buildRevision(revision);
}
await selectPwaFixtureRevision("A");

console.log("Prepared deterministic PWA update fixture revisions A and B.");
