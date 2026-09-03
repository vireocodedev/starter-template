import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const readText = (path) => readFileSync(join(root, path), "utf8");
const problems = [];
const exact = (actual, expected, label) => {
  if (!Array.isArray(actual) || new Set(actual).size !== actual.length || actual.length !== expected.length || [...actual].sort().join("\n") !== [...expected].sort().join("\n")) problems.push(`${label} must contain exactly ${expected.join(", ")}`);
};
const main = readJson(".github/rulesets/main.json");
if (main.name !== "Protect main" || main.target !== "branch" || main.enforcement !== "active") problems.push("main ruleset must be active and target main");
if (!Array.isArray(main.bypass_actors) || main.bypass_actors.length) problems.push("main ruleset must not grant bypass actors");
if (main.conditions?.ref_name?.include?.length !== 1 || main.conditions.ref_name.include[0] !== "refs/heads/main" || main.conditions.ref_name?.exclude?.length !== 0) problems.push("main ruleset must include exactly refs/heads/main");
exact(main.rules?.map((rule) => rule.type) ?? [], ["deletion", "non_fast_forward", "pull_request", "required_status_checks"], "main ruleset rules");
const pullRequest = main.rules?.find((rule) => rule.type === "pull_request")?.parameters;
if (!pullRequest || pullRequest.dismiss_stale_reviews_on_push !== true || pullRequest.require_code_owner_review !== false || pullRequest.require_last_push_approval !== false || pullRequest.required_approving_review_count !== 0 || pullRequest.required_review_thread_resolution !== true) problems.push("main ruleset must retain the interim single-maintainer pull-request controls");
const statusChecks = main.rules?.find((rule) => rule.type === "required_status_checks")?.parameters;
if (!statusChecks || statusChecks.strict_required_status_checks_policy !== true || statusChecks.do_not_enforce_on_create !== false) problems.push("main ruleset must require strict status checks");
exact(statusChecks?.required_status_checks?.map((check) => `${check.context}:${check.integration_id}`) ?? [], ["verify:15368", "analyze:15368", "CodeQL:57789", "dependency-review:15368", "Secret history scan:15368"], "main ruleset required status checks");
const actions = readJson(".github/settings/actions.json");
const selectedActions = readJson(".github/settings/selected-actions.json");
if (actions.enabled !== true || actions.allowed_actions !== "selected" || actions.sha_pinning_required !== true || selectedActions.github_owned_allowed !== true || selectedActions.verified_allowed !== false) problems.push("Actions permissions and selected-actions payloads must retain the documented policy");
exact(selectedActions.patterns_allowed, ["gradle/actions/setup-gradle@9c971963bec38e04b3d30dcc455b5382be2fdbfb"], "Actions allowlist patterns");
const permissions = readJson(".github/settings/workflow-permissions.json");
if (permissions.default_workflow_permissions !== "read" || permissions.can_approve_pull_request_reviews !== false) problems.push("workflow-token defaults must remain read-only and unable to approve pull requests");
const environment = readJson(".github/environments/template-release.json");
const deploymentPolicies = readJson(".github/environments/template-release.deployment-branch-policies.json");
const environmentLiveAssertions = readJson(".github/environments/template-release.live-assertions.json");
const wildcardTagRuleset = readJson(".github/rulesets/starter-template-tags.json");
const flagship = readJson("contracts/flagship-demo-policy.json");
if (environment.wait_timer !== 0 || environment.prevent_self_review !== false || environmentLiveAssertions.can_admins_bypass !== false) problems.push("template-release environment must retain its documented no-bypass policy");
if (!Array.isArray(environment.reviewers) || environment.reviewers.length !== 0) problems.push("template-release must not require a recurring reviewer");
if (environment.deployment_branch_policy?.protected_branches !== false || environment.deployment_branch_policy?.custom_branch_policies !== true || JSON.stringify(deploymentPolicies) !== JSON.stringify([{ name: "main", type: "branch" }])) problems.push("template-release must permit exactly main deployment runs");
const flagshipEnvironment = flagship.automation?.deploymentEnvironment;
if (!flagshipEnvironment || flagshipEnvironment.name !== "flagship-demo" || flagshipEnvironment.wait_timer !== 0 || flagshipEnvironment.prevent_self_review !== false || flagshipEnvironment.can_admins_bypass !== false || !Array.isArray(flagshipEnvironment.reviewers) || flagshipEnvironment.reviewers.length !== 0 || flagshipEnvironment.deployment_branch_policy?.protected_branches !== false || flagshipEnvironment.deployment_branch_policy?.custom_branch_policies !== true || JSON.stringify(flagshipEnvironment.allowedBranchPolicies) !== JSON.stringify([{ name: "starter-template@*", type: "tag" }])) problems.push("flagship-demo environment desired state must be an explicit no-bypass immutable-tag-only policy");
if (wildcardTagRuleset.name !== "Protect starter-template release tags" || wildcardTagRuleset.target !== "tag" || wildcardTagRuleset.enforcement !== "active" || !Array.isArray(wildcardTagRuleset.bypass_actors) || wildcardTagRuleset.bypass_actors.length || JSON.stringify(wildcardTagRuleset.conditions?.ref_name) !== JSON.stringify({ include: ["refs/tags/starter-template@*"], exclude: [] }) || JSON.stringify(wildcardTagRuleset.rules?.map((rule) => rule.type).sort()) !== JSON.stringify(["deletion", "non_fast_forward", "update"])) problems.push("wildcard starter-template tag ruleset must exactly preserve immutable update, non-fast-forward, and deletion protection");
if (readText(".github/CODEOWNERS").trim() !== "* @brunotot") problems.push("CODEOWNERS must retain the interim valid @brunotot owner");
if (problems.length) {
  console.error("Repository security desired-state policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log("Repository security desired-state policy passed: main, Actions, workflow defaults, and release environments.");
