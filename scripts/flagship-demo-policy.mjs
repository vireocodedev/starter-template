import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(join(root, "contracts/flagship-demo-policy.json"), "utf8"));
const problems = [];

for (const path of [
  "compose.demo.yaml",
  "docs/flagship-demo.md",
  "frontend/playwright.demo.config.ts",
  "frontend/tests/demo/flagship-demo.spec.ts",
  ".github/workflows/flagship-demo.yml",
  "scripts/reset-flagship-demo.sh",
]) {
  if (!existsSync(join(root, path))) problems.push(`missing demo contract surface: ${path}`);
}

if (policy.schemaVersion !== 1) problems.push("schemaVersion must be 1");
if (policy.publicUrl !== null && !String(policy.publicUrl).startsWith("https://")) {
  problems.push("publicUrl must be null before activation or an HTTPS URL");
}
if (policy.availabilityClaim !== "none-until-activated") {
  problems.push("availabilityClaim must remain none-until-activated before public URL evidence exists");
}
if (policy.dataClassification !== "public-synthetic-only") {
  problems.push("the demo must accept public synthetic data only");
}
if (policy.reset?.maximumIntervalHours > 24) problems.push("demo reset interval must not exceed 24 hours");

const workflow = readFileSync(join(root, ".github/workflows/flagship-demo.yml"), "utf8");
if (!workflow.includes("corepack npm --prefix frontend run test:demo")) {
  problems.push("flagship demo workflow must execute the documented synthetic journey");
}
const compose = readFileSync(join(root, "compose.demo.yaml"), "utf8");
if (!compose.includes("SPRING_PROFILES_ACTIVE: prod,demo")) {
  problems.push("demo compose overlay must preserve production defaults and activate deterministic demo data");
}

if (problems.length > 0) {
  console.error("Flagship demo policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Flagship demo policy passed: ${policy.dataClassification}, ${policy.reset.maximumIntervalHours}h maximum reset interval, public URL ${policy.publicUrl ?? "awaiting activation"}.`,
);
