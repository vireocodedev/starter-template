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
]) {
  if (!existsSync(join(root, path)))
    problems.push(`missing demo contract surface: ${path}`);
}

if (policy.schemaVersion !== 1) problems.push("schemaVersion must be 1");
if (
  policy.publicUrl !== null &&
  !String(policy.publicUrl).startsWith("https://")
) {
  problems.push("publicUrl must be null before activation or an HTTPS URL");
}
if (policy.availabilityClaim !== "none-until-activated") {
  problems.push(
    "availabilityClaim must remain none-until-activated before public URL evidence exists",
  );
}
if (policy.dataClassification !== "public-synthetic-only") {
  problems.push("the demo must accept public synthetic data only");
}
if (policy.reset?.maximumIntervalHours > 24)
  problems.push("demo reset interval must not exceed 24 hours");

const workflow = readFileSync(
  join(root, ".github/workflows/flagship-demo.yml"),
  "utf8",
);
if (!workflow.includes("corepack npm --prefix frontend run test:demo")) {
  problems.push(
    "flagship demo workflow must execute the documented synthetic journey",
  );
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

const developmentCompose = readFileSync(join(root, "compose.dev.yaml"), "utf8");
if (!developmentCompose.includes("127.0.0.1:${POSTGRES_PORT:-5432}:5432")) {
  problems.push(
    "the development-only PostgreSQL port must bind to host loopback",
  );
}

const caddy = readFileSync(join(root, "deploy/hetzner/Caddyfile"), "utf8");
if (
  !caddy.includes("demo.vireocode.com") ||
  !caddy.includes("reverse_proxy 127.0.0.1:3000")
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

if (problems.length > 0) {
  console.error("Flagship demo policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Flagship demo policy passed: ${policy.dataClassification}, ${policy.reset.maximumIntervalHours}h maximum reset interval, public URL ${policy.publicUrl ?? "awaiting activation"}.`,
);
