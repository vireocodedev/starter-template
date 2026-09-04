import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const rulesetUrl = new URL("../.github/rulesets/main.json", import.meta.url);
const ruleset = existsSync(rulesetUrl) ? JSON.parse(readFileSync(rulesetUrl, "utf8")) : undefined;
const actionContexts = ruleset?.rules.find(rule => rule.type === "required_status_checks").parameters.required_status_checks.filter(check => check.integration_id === 15368).map(check => check.context).sort();

function jobBlock(workflow, job) {
  const lines = workflow.split("\n");
  const start = lines.indexOf(`  ${job}:`);
  const end = lines.findIndex((line, index) => index > start && /^ {2}[A-Za-z0-9_-]+:$/u.test(line));
  return start < 0 ? "" : lines.slice(start, end < 0 ? undefined : end).join("\n");
}

test("required contexts remain exact and always report on pull requests", { skip: !ruleset }, () => {
  assert.deepEqual(actionContexts, ["Application and deployment verification", "CodeQL analysis", "Dependency review", "Secret history scan"]);
  for (const [path, job, context, expectedIf] of [[".github/workflows/ci.yml", "verify", "Application and deployment verification", "always()"], [".github/workflows/codeql.yml", "analyze", "CodeQL analysis", "always()"], [".github/workflows/security.yml", "dependency-review", "Dependency review", "always() && github.event_name == 'pull_request'"], [".github/workflows/security.yml", "secret-scan", "Secret history scan", null]]) {
    const workflow = read(path); const block = jobBlock(workflow, job);
    assert.match(workflow, /^ {2}pull_request:/mu, `${context} must be available to pull requests`);
    assert.notEqual(block, "", `${context} must exist`);
    assert.match(block, new RegExp(`^    name: ${context.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "mu"));
    const ifLine = block.split("\n").find(line => line.startsWith("    if:"));
    assert.equal(ifLine ?? null, expectedIf === null ? null : `    if: ${expectedIf}`);
  }
});

test("the independent GitHub CodeQL integration and consolidated security workflow remain required", { skip: !ruleset }, () => {
  const checks = ruleset.rules.find(rule => rule.type === "required_status_checks").parameters.required_status_checks;
  assert.ok(checks.some(check => check.context === "CodeQL" && check.integration_id === 57789));
  assert.equal(
    existsSync(new URL("../.github/workflows/dependency-review.yml", import.meta.url)),
    false,
  );
});

test("selected dependency review checks out the pull request before analysis", () => {
  const security = read(".github/workflows/security.yml");
  const review = jobBlock(security, "dependency-review");
  const checkout = review.indexOf("uses: actions/checkout@");
  const analysis = review.indexOf("uses: actions/dependency-review-action@");
  assert.ok(checkout >= 0 && checkout < analysis);
  assert.match(review, /persist-credentials: false/u);
});

test("required verification propagates documentation and routing failures", () => {
  const workflow = read(".github/workflows/ci.yml");
  const verification = jobBlock(workflow, "verify");
  assert.match(verification, /COORDINATOR_RESULT: \$\{\{ needs\.changes\.result \}\}/u);
  assert.match(verification, /test "\$COORDINATOR_RESULT" = success/u);
});

test("documentation validation remains safe in projected applications", () => {
  const workflow = read(".github/workflows/ci.yml");
  assert.match(workflow, /git diff --check "\$BASE_SHA" "\$HEAD_SHA"/u);
  assert.match(workflow, /if \[ -f scripts\/public-contract-policy\.mjs \]; then/u);
});

test("pull-request planners execute the trusted base revision or fail closed", () => {
  for (const path of [
    ".github/workflows/ci.yml",
    ".github/workflows/codeql.yml",
    ".github/workflows/security.yml",
  ]) {
    const workflow = read(path);
    assert.match(workflow, /git cat-file -e "\$BASE_SHA:scripts\/ci-change-plan\.mjs"/u, path);
    assert.match(workflow, /git worktree add --detach "\$planner_root" "\$BASE_SHA"/u, path);
    assert.match(workflow, /node "\$planner_root\/scripts\/ci-change-plan\.mjs"/u, path);
    assert.match(workflow, /^\s*verification=true$/mu, path);
    assert.match(workflow, /^\s*deployment=true$/mu, path);
    assert.match(workflow, /^\s*codeql-java=true$/mu, path);
    assert.match(workflow, /^\s*codeql-javascript=true$/mu, path);
    assert.match(workflow, /^\s*dependency-review=true$/mu, path);
    assert.match(workflow, /reason=base-planner-unavailable; running every lane/u, path);
  }
});

test("documentation-only pull requests retain GitHub's independent CodeQL result", () => {
  const workflow = read(".github/workflows/codeql.yml");
  const javascript = jobBlock(workflow, "analyze-javascript");
  assert.match(
    javascript,
    /github\.event_name == 'pull_request' \|\| needs\.changes\.outputs\.javascript == 'true'/u,
  );
});
