import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  logicalDocumentationPath,
  logicalRepository,
  validatePlatformSupportPolicy,
} from "./platform-support-policy.mjs";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function createRenamedCheckout(mutatePolicy = (policy) => policy) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "vireo-platform-policy-"));
  const root = join(temporaryRoot, "renamed-checkout");
  const policy = JSON.parse(
    readFileSync(
      join(sourceRoot, "contracts/platform-support-policy.json"),
      "utf8",
    ),
  );
  mutatePolicy(policy);

  mkdirSync(join(root, "contracts"), { recursive: true });
  mkdirSync(join(root, dirname(logicalDocumentationPath)), { recursive: true });
  mkdirSync(join(root, ".github", "workflows"), { recursive: true });
  writeFileSync(
    join(root, "contracts/platform-support-policy.json"),
    `${JSON.stringify(policy, null, 2)}\n`,
  );
  copyFileSync(
    join(sourceRoot, logicalDocumentationPath),
    join(root, logicalDocumentationPath),
  );
  for (const workflow of new Set(
    policy.rows.flatMap((row) =>
      (row.evidence?.lanes ?? [])
        .filter((lane) => lane.repository === logicalRepository)
        .map((lane) => lane.workflow),
    ),
  )) {
    copyFileSync(
      join(sourceRoot, ".github", "workflows", workflow),
      join(root, ".github", "workflows", workflow),
    );
  }

  return { root, temporaryRoot };
}

function withRenamedCheckout(mutatePolicy, assertion) {
  const fixture = createRenamedCheckout(mutatePolicy);
  try {
    assertion(fixture.root);
  } finally {
    rmSync(fixture.temporaryRoot, { recursive: true, force: true });
  }
}

test("validates stable logical lanes from a renamed checkout", () => {
  withRenamedCheckout(undefined, (root) => {
    const result = validatePlatformSupportPolicy({ root });

    assert.deepEqual(result.problems, []);
    assert.ok(result.localWorkflowLanes > 0);
  });
});

test("rejects an unknown local repository identity", () => {
  withRenamedCheckout(undefined, (root) => {
    const result = validatePlatformSupportPolicy({
      root,
      repository: "renamed-checkout",
    });

    assert.match(
      result.problems.join("\n"),
      /unknown logical repository "renamed-checkout"/u,
    );
    assert.match(
      result.problems.join("\n"),
      /renamed-checkout has no matching local workflow lanes/u,
    );
  });
});

test("rejects an unknown repository lane", () => {
  withRenamedCheckout(
    (policy) => {
      const lane = policy.rows
        .flatMap((row) => row.evidence?.lanes ?? [])
        .find((candidate) => candidate.repository === logicalRepository);
      lane.repository = "unknown-lane-repository";
    },
    (root) => {
      const result = validatePlatformSupportPolicy({ root });

      assert.match(
        result.problems.join("\n"),
        /references unknown logical repository "unknown-lane-repository"/u,
      );
    },
  );
});
