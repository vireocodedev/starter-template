import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import { compareTemplateReleaseTags, isAutomationEraTemplateTag, planDurableTagRecovery, selectLatestImmutableTemplateRelease } from "./template-release-reconciliation.mjs";

test("latest reconciliation selects the maximum immutable stable Template release", () => {
  const latest = selectLatestImmutableTemplateRelease([
    { tag_name: "starter-template@0.8.7", draft: false, prerelease: false, immutable: true, validated: true },
    { tag_name: "starter-template@0.8.8", draft: false, prerelease: false, immutable: true, validated: true },
    { tag_name: "starter-template@9.0.0-beta.1", draft: false, prerelease: true, immutable: true, validated: true },
    { tag_name: "starter-template@1.0.0", draft: true, prerelease: false, immutable: true, validated: true },
    { tag_name: "starter-template@9.9.9", draft: false, prerelease: false, immutable: true, validated: false },
  ]);
  assert.equal(latest.tag_name, "starter-template@0.8.8");
  assert.ok(compareTemplateReleaseTags("starter-template@0.8.8", "starter-template@0.8.7") > 0);
  assert.equal(selectLatestImmutableTemplateRelease([
    { tag_name: "starter-template@9.9.9", draft: false, prerelease: false, immutable: true, validated: false },
    { tag_name: "starter-template@9.9.9-beta.1", draft: false, prerelease: true, immutable: true, validated: true },
  ]), undefined);
});

test("durable scanner visits every annotated automation-era stable tag so invalid published releases fail closed", () => {
  const tags = planDurableTagRecovery({
    refs: [
      { ref: "refs/tags/starter-template@0.8.8", object: { type: "tag" } },
      { ref: "refs/tags/starter-template@0.8.7", object: { type: "tag" } },
      { ref: "refs/tags/starter-template@0.8.9-beta.1", object: { type: "tag" } },
      { ref: "refs/tags/starter-template@0.6.0", object: { type: "tag" } },
      { ref: "refs/tags/starter-template@0.8.6", object: { type: "commit" } },
    ],
    releases: [],
  });
  assert.deepEqual(tags, ["starter-template@0.8.8"]);
  assert.equal(isAutomationEraTemplateTag("starter-template@0.8.8"), true);
  assert.equal(isAutomationEraTemplateTag("starter-template@0.8.7"), false);
  assert.equal(isAutomationEraTemplateTag("starter-template@0.8.8-beta.1"), false);
});

test("JVM archive tasks opt into Gradle reproducible ordering and timestamps", () => {
  const build = readFileSync(join(resolve(import.meta.dirname, ".."), "build.gradle"), "utf8");
  assert.match(build, /tasks\.withType\(AbstractArchiveTask\)\.configureEach/u);
  assert.match(build, /preserveFileTimestamps\s*=\s*false/u);
  assert.match(build, /reproducibleFileOrder\s*=\s*true/u);
});

test("durable scanner waits for reusable recovery and dispatches only the newest eligible exact tag", () => {
  const workflow = readFileSync(
    join(resolve(import.meta.dirname, ".."), ".github/workflows/template-release.yml"),
    "utf8",
  );
  const recovery = workflow.slice(
    workflow.indexOf("  recover-durable-tags:"),
    workflow.indexOf("  reconcile-durable-latest:"),
  );
  const latest = workflow.slice(
    workflow.indexOf("  reconcile-durable-latest:"),
    workflow.indexOf("  dispatch-flagship-demo:"),
  );
  const reusable = readFileSync(
    join(resolve(import.meta.dirname, ".."), ".github/workflows/template-release-recover.yml"),
    "utf8",
  );
  assert.match(recovery, /uses: \.\/\.github\/workflows\/template-release-recover\.yml/u);
  assert.match(recovery, /contents: write/u);
  assert.doesNotMatch(recovery, /actions: write|secrets: inherit/u);
  assert.match(latest, /needs\.recover-durable-tags\.result == 'success'/u);
  assert.match(latest, /assert-automation-tag/u);
  assert.match(latest, /git show "\$release_commit:contracts\/template-release-policy\.json"/u);
  assert.match(latest, /gh workflow run flagship-demo\.yml/u);
  assert.match(reusable, /workflow_call:/u);
  assert.match(reusable, /environment: template-release/u);
  assert.match(reusable, /contents: write/u);
  assert.match(reusable, /for attempt in 1 2 3 4 5 6/u);
  assert.match(reusable, /Recovered release-state planner attempt/u);
  assert.doesNotMatch(reusable, /workflow_dispatch:|actions: write/u);
  assert.doesNotMatch(workflow, /reconcile_tag|  reconcile-durable-tag:/u);
});
