import assert from "node:assert/strict";
import test from "node:test";
import { evaluateVerificationHost } from "./verification-host.mjs";

const ubuntu =
  'ID=ubuntu\nVERSION_ID="24.04"\nPRETTY_NAME="Ubuntu 24.04 LTS"\n';

test("admits only the evidenced Ubuntu verification host", () => {
  assert.deepEqual(
    evaluateVerificationHost({
      platform: "linux",
      architecture: "x64",
      osRelease: ubuntu,
      gnuTime: true,
      gnuDate: true,
    }),
    {
      status: "pass",
      summary:
        "Authoritative verification host: Ubuntu 24.04 x86-64 with GNU time/date",
    },
  );
});

test("fails when a supported host cannot execute the authoritative verifier", () => {
  const result = evaluateVerificationHost({
    platform: "linux",
    architecture: "x64",
    osRelease: ubuntu,
    gnuTime: false,
    gnuDate: true,
  });
  assert.equal(result.status, "fail");
  assert.match(result.remedy, /GNU time/u);
});

test("does not mistake WSL or another architecture for supported Ubuntu", () => {
  const wsl = evaluateVerificationHost({
    platform: "linux",
    architecture: "x64",
    osRelease: ubuntu,
    kernelRelease: "5.15.153.1-microsoft-standard-WSL2",
    gnuTime: true,
    gnuDate: true,
  });
  const arm = evaluateVerificationHost({
    platform: "linux",
    architecture: "arm64",
    osRelease: ubuntu,
    gnuTime: true,
    gnuDate: true,
  });

  assert.equal(wsl.status, "warn");
  assert.match(wsl.summary, /Windows\/WSL2/u);
  assert.equal(arm.status, "warn");
  assert.match(arm.summary, /outside the supported/u);
});
