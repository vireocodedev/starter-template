import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(
  readFileSync(join(root, "contracts/flagship-demo-policy.json"), "utf8"),
);
const problems = [];

for (const path of [
  "compose.demo.yaml",
  "compose.dev.yaml",
  "docs/flagship-demo.md",
  "frontend/playwright.demo.config.ts",
  "frontend/tests/demo/flagship-demo.spec.ts",
  ".github/workflows/flagship-demo.yml",
  "scripts/reset-flagship-demo.sh",
  "deploy/hetzner/Caddyfile",
  "deploy/hetzner/README.md",
  "deploy/hetzner/deploy.sh",
  "deploy/hetzner/install-host-integration.sh",
  "deploy/hetzner/vireo-flagship-demo.env.example",
  "deploy/hetzner/vireo-flagship-demo-reset.service",
  "deploy/hetzner/vireo-flagship-demo-reset.timer",
  "deploy/hetzner/flagship-deployment-bundle.mjs",
  "deploy/hetzner/flagship-host-deploy.sh",
  "deploy/hetzner/vireo-flagship-ingress.sh",
  "deploy/hetzner/vireo-flagship-demo-watchdog.service",
  "deploy/hetzner/vireo-flagship-demo-watchdog.timer",
  "deploy/hetzner/vireo-flagship-demo-watchdog.sh",
  "deploy/hetzner/vireo-flagship-receiver.sh",
]) {
  if (!existsSync(join(root, path)))
    problems.push(`missing demo contract surface: ${path}`);
}

if (policy.schemaVersion !== 2) problems.push("schemaVersion must be 2");
if (
  policy.publicUrl !== null &&
  !String(policy.publicUrl).startsWith("https://")
) {
  problems.push("publicUrl must be null before activation or an HTTPS URL");
}
const activated = policy.publicUrl !== null;
if (!activated && policy.availabilityClaim !== "none-until-activated") {
  problems.push("an inactive demo must not make an availability claim");
}
if (activated && policy.availabilityClaim !== "best-effort-no-sla") {
  problems.push("an active demo must state its best-effort, no-SLA boundary");
}
if (activated) {
  if (!policy.operations?.releaseIdentity || !policy.operations?.owner) {
    problems.push("an active demo must define immutable release identity and owner");
  }
  if (!String(policy.operations?.incidentPath ?? "").startsWith("https://")) {
    problems.push("an active demo must publish an HTTPS incident path");
  }
}
if (policy.dataClassification !== "public-synthetic-only") {
  problems.push("the demo must accept public synthetic data only");
}
if (policy.reset?.maximumIntervalHours > 24)
  problems.push("demo reset interval must not exceed 24 hours");
if (policy.reset?.durableBackupClaim !== false)
  problems.push("the disposable flagship must not claim durable backup coverage");
if (policy.reset?.command !== "VIREO_FLAGSHIP_PRODUCTION_RESET=true VIREO_DEMO_RESET_CONFIRM=reset-vireo-demo ./scripts/reset-flagship-demo.sh")
  problems.push("the production reset contract must require its explicit production guard");
const automation = policy.automation;
if (automation?.deploymentEnvironment?.name !== "flagship-demo" ||
  automation.deploymentEnvironment.can_admins_bypass !== false ||
  automation.deploymentEnvironment.wait_timer !== 0 ||
  JSON.stringify(automation.deploymentEnvironment.allowedBranchPolicies) !== JSON.stringify([{ name: "starter-template@*", type: "tag" }])) {
  problems.push("flagship-demo environment desired state must be explicit and no-bypass");
}
if (policy.monitor?.deploymentProofVariable !== "VIREO_DEMO_REQUIRE_DEPLOYMENT_PROOF" || policy.monitor?.deploymentProofRequiredAfterFirstAcceptedRelease !== true)
  problems.push("flagship monitor must declare its migration-aware deployment-proof gate");
if (automation?.ssh?.nativeOpenSshOnly !== true || automation.ssh.strictHostKeyChecking !== true ||
  JSON.stringify([automation.ssh.hostVariable, automation.ssh.userVariable, automation.ssh.portVariable, automation.ssh.knownHostsVariable, automation.ssh.privateKeySecret]) !== JSON.stringify(["FLAGSHIP_DEMO_HOST", "FLAGSHIP_DEMO_SSH_USER", "FLAGSHIP_DEMO_SSH_PORT", "FLAGSHIP_DEMO_KNOWN_HOSTS", "FLAGSHIP_DEMO_SSH_PRIVATE_KEY"])) {
  problems.push("flagship deployment must declare the exact native OpenSSH credential boundary");
}
if (JSON.stringify(automation?.slots?.names) !== JSON.stringify(["blue", "green"]) ||
  automation?.slots?.ports?.blue !== 3001 || automation?.slots?.ports?.green !== 3002 ||
  automation?.bundle?.requiredProofPath !== "/.well-known/vireo-deployment.json") {
  problems.push("flagship deployment must retain declared blue/green slots and revision proof path");
}

const workflow = readFileSync(
  join(root, ".github/workflows/flagship-demo.yml"),
  "utf8",
);
if (!workflow.includes("corepack npm --prefix frontend run test:demo")) {
  problems.push(
    "flagship demo workflow must execute the documented synthetic journey",
  );
}
for (const fragment of [
  "workflow_dispatch:", "preflight", "environment: flagship-demo",
  "StrictHostKeyChecking=yes", "FLAGSHIP_DEMO_SSH_PRIVATE_KEY",
  "refs/tags/${{ inputs.tag }}", "flagship-demo-${{ inputs.mode == 'deploy' && inputs.tag",
  "actions: read", "dataClassification!==\"public-synthetic-only\"",
]) if (!workflow.includes(fragment)) problems.push(`flagship workflow must contain ${JSON.stringify(fragment)}`);
for (const fragment of [
  "timeout-minutes: 90",
  "for attempt in $(seq 1 61)",
  "test \"$prepare_exit\" = 75 && grep -Fxq 'CAS generation changed.'",
  "test \"$status\" != busy && test \"$status\" != retry",
]) if (!workflow.includes(fragment)) problems.push(`flagship workflow must retry only stale prepare CAS failures: ${JSON.stringify(fragment)}`);
if (/appleboy|ssh-action|webfactory\/ssh-agent/u.test(workflow))
  problems.push("flagship workflow must use native OpenSSH rather than an SSH action");
const templateReleaseWorkflow = readFileSync(join(root, ".github/workflows/template-release.yml"), "utf8");
const dispatchIndex = templateReleaseWorkflow.indexOf("dispatch-flagship-demo:");
const releaseIndex = templateReleaseWorkflow.indexOf("  release:");
const historicalIndex = templateReleaseWorkflow.indexOf("  historical-recovery:");
const scannerIndex = templateReleaseWorkflow.indexOf("  scan-durable-releases:");
const reusableRecoveryIndex = templateReleaseWorkflow.indexOf("  recover-durable-tags:");
const scannerLatestIndex = templateReleaseWorkflow.indexOf("  reconcile-durable-latest:");
if (dispatchIndex < 0 || releaseIndex < 0 || historicalIndex < 0 ||
  templateReleaseWorkflow.slice(releaseIndex, historicalIndex).includes("actions: write") ||
  scannerIndex < 0 || reusableRecoveryIndex < 0 || scannerLatestIndex < 0 ||
  templateReleaseWorkflow.includes("  reconcile-durable-tag:") ||
  !templateReleaseWorkflow.slice(reusableRecoveryIndex, scannerLatestIndex).includes("      contents: write") ||
  templateReleaseWorkflow.slice(reusableRecoveryIndex, scannerLatestIndex).includes("      actions: write") ||
  templateReleaseWorkflow.slice(reusableRecoveryIndex, scannerLatestIndex).includes("secrets: inherit") ||
  !templateReleaseWorkflow.slice(scannerLatestIndex, dispatchIndex).includes("    environment: template-release") ||
  !templateReleaseWorkflow.slice(scannerLatestIndex, dispatchIndex).includes("      actions: write") ||
  !templateReleaseWorkflow.slice(scannerLatestIndex, dispatchIndex).includes("      contents: write") ||
  !templateReleaseWorkflow.slice(scannerLatestIndex, dispatchIndex).includes("name: Compare the newest eligible immutable release with public deployment proof") ||
  !templateReleaseWorkflow.slice(scannerLatestIndex, dispatchIndex).includes("gh workflow run flagship-demo.yml") ||
  !templateReleaseWorkflow.slice(dispatchIndex).includes("actions: write")) {
  problems.push("publication must remain least-privilege while reusable recovery, protected latest reconciliation, and flagship dispatch receive only their required write permissions");
}
if (!templateReleaseWorkflow.includes("always() && !cancelled()") || !templateReleaseWorkflow.includes("Refuse a release superseded by a newer main release policy")) {
  problems.push("Template release must retain rerun-safe dispatch and superseded-release refusal");
}
const compose = readFileSync(join(root, "compose.demo.yaml"), "utf8");
if (!compose.includes("SPRING_PROFILES_ACTIVE: prod,demo")) {
  problems.push(
    "demo compose overlay must preserve production defaults and activate deterministic demo data",
  );
}
if ((compose.match(/restart: unless-stopped/g) ?? []).length !== 3) {
  problems.push("all demo services must survive an ordinary host restart");
}
for (const limit of ["mem_limit: 384m", "mem_limit: 768m", "mem_limit: 128m"]) {
  if (!compose.includes(limit)) {
    problems.push(`the demo resource envelope is missing ${limit}`);
  }
}

const baseCompose = readFileSync(join(root, "compose.yaml"), "utf8");
if (baseCompose.includes("5432:5432")) {
  problems.push(
    "the canonical deployment must not publish PostgreSQL to the host",
  );
}
if (!baseCompose.includes("127.0.0.1:${FRONTEND_PORT:-3000}:8080")) {
  problems.push("the canonical frontend must bind to host loopback");
}

export function hostEnvironmentContractProblems(hostEnvironment) {
  const contractProblems = [];
  const hostEnvironmentValues = new Map();
  for (const rawLine of hostEnvironment.split(/\r?\n/)) {
    if (/^\s*(?:#.*)?$/.test(rawLine)) continue;
    const assignment = rawLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!assignment) {
      contractProblems.push(
        "the host environment template contains a malformed assignment",
      );
      continue;
    }
    const [, variable, value] = assignment;
    if (hostEnvironmentValues.has(variable)) {
      contractProblems.push(`the host environment template duplicates ${variable}`);
      continue;
    }
    hostEnvironmentValues.set(variable, value);
  }
  for (const variable of [
    "POSTGRES_OWNER_USER",
    "POSTGRES_OWNER_PASSWORD",
    "POSTGRES_RUNTIME_USER",
    "POSTGRES_RUNTIME_PASSWORD",
  ]) {
  if (!hostEnvironmentValues.get(variable)) {
    contractProblems.push(`the host environment template must define ${variable}`);
  }
}
if (hostEnvironmentValues.get("SESSION_COOKIE_SECURE") !== "true") {
  contractProblems.push(
    "the host environment template must set SESSION_COOKIE_SECURE=true",
  );
}
if (hostEnvironmentValues.has("FRONTEND_PORT")) {
  contractProblems.push(
    "the host environment template must not fix a frontend port; the transaction controller selects its slot",
  );
}
if (
    hostEnvironmentValues.has("POSTGRES_USER") ||
    hostEnvironmentValues.has("POSTGRES_PASSWORD")
  ) {
    contractProblems.push(
      "the host environment template must not use the legacy single database identity",
    );
  }
  const ownerUser = hostEnvironmentValues.get("POSTGRES_OWNER_USER");
  const runtimeUser = hostEnvironmentValues.get("POSTGRES_RUNTIME_USER");
  const ownerPassword = hostEnvironmentValues.get("POSTGRES_OWNER_PASSWORD");
  const runtimePassword = hostEnvironmentValues.get("POSTGRES_RUNTIME_PASSWORD");
  if (
    ownerUser &&
    runtimeUser &&
    ownerUser.toLowerCase() === runtimeUser.toLowerCase()
  ) {
    contractProblems.push(
      "the host environment template must use distinct owner and runtime database users",
    );
  }
  if (ownerPassword && runtimePassword && ownerPassword === runtimePassword) {
    contractProblems.push(
      "the host environment template must use distinct owner and runtime database secrets",
    );
  }
  return contractProblems;
}

const hostEnvironment = readFileSync(
  join(root, "deploy/hetzner/vireo-flagship-demo.env.example"),
  "utf8",
);
problems.push(...hostEnvironmentContractProblems(hostEnvironment));

const developmentCompose = readFileSync(join(root, "compose.dev.yaml"), "utf8");
if (!developmentCompose.includes("127.0.0.1:${POSTGRES_PORT:-5432}:5432")) {
  problems.push(
    "the development-only PostgreSQL port must bind to host loopback",
  );
}

const caddy = readFileSync(join(root, "deploy/hetzner/Caddyfile"), "utf8");
if (
  !caddy.includes("demo.vireocode.com") ||
  !caddy.includes("/etc/caddy/upstreams/vireo-flagship-demo") ||
  !caddy.includes("Cache-Control \"no-store\"")
) {
  problems.push(
    "the audited host route must proxy demo.vireocode.com to loopback",
  );
}

const nginx = readFileSync(join(root, "frontend/nginx.conf"), "utf8");
if (!nginx.includes("^/actuator/health/(liveness|readiness)$")) {
  problems.push(
    "the public frontend must expose only the backend liveness and readiness probes",
  );
}

const timer = readFileSync(
  join(root, "deploy/hetzner/vireo-flagship-demo-reset.timer"),
  "utf8",
);
if (
  !timer.includes("OnCalendar=*-*-* 04:17:00 UTC") ||
  !timer.includes("Persistent=true")
) {
  problems.push("the host reset timer must be persistent and run every day");
}
const flagshipDocs = readFileSync(join(root, "docs/flagship-demo.md"), "utf8");
if (!flagshipDocs.includes("operations/deployment-state.json") ||
  !flagshipDocs.includes("journalctl -u vireo-flagship-demo-reset.service") ||
  !flagshipDocs.includes("journalctl -u vireo-flagship-demo-watchdog.service") ||
  flagshipDocs.includes("Retained pre-reset, reset, and post-reset evidence")) {
  problems.push("flagship availability evidence must point to host state and service journals");
}
const hostController = readFileSync(join(root, "deploy/hetzner/flagship-host-deploy.sh"), "utf8");
for (const fragment of ["flock -x", "schemaVersion\":2", "generation", "phase:\"staging\"", "pending.phase=\"prepared\"", "phase=\"cutover\"", "3001", "3002", "--volumes --remove-orphans", "vireo-flagship-demo-$target", "public-synthetic-only", "vireo-flagship-ingress", "CAS generation changed"]) {
  if (!hostController.includes(fragment)) problems.push(`host transaction controller must contain ${JSON.stringify(fragment)}`);
}
if (hostController.includes("docker system prune") || hostController.includes("docker volume prune")) problems.push("host transaction controller must never globally prune Docker state");

if (problems.length > 0) {
  console.error("Flagship demo policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Flagship demo policy passed: ${policy.dataClassification}, ${policy.reset.maximumIntervalHours}h maximum reset interval, public URL ${policy.publicUrl ?? "awaiting activation"}.`,
);
