import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const requiredText = {
  "docs/flagship.md": ["Primary evaluation path", "Honest boundary", "assets/flagship-overview.png"],
  "docs/flagship-architecture.md": ["AppPageHome", "ItemQuery.search", "buildHomeOverviewSnapshot"],
  "docs/comparison.md": ["Manual React + Spring Boot assembly", "Hilla", "JHipster", "Refine"],
  "docs/recipes/overview-threshold.md": ["HOME_LOW_STOCK_THRESHOLD", "home-overview.test.ts"],
  "docs/recipes/generate-capability.md": ["--dry-run", "generate:check"],
  "docs/recipes/rehearse-demo-reset.md": ["VIREO_DEMO_RESET_CONFIRM", "vireo-flagship-demo-local"],
  "docs/tutorials/evaluate-flagship.md": ["npm create vireo@latest", "./scripts/verify.sh"],
};

for (const [path, fragments] of Object.entries(requiredText)) {
  let contents;
  try {
    contents = readFileSync(join(root, path), "utf8");
  } catch {
    problems.push(`missing proof surface: ${path}`);
    continue;
  }
  for (const fragment of fragments) {
    if (!contents.includes(fragment)) problems.push(`${path} must contain ${JSON.stringify(fragment)}`);
  }
}

try {
  const png = readFileSync(join(root, "docs/assets/flagship-overview.png"));
  const signature = "89504e470d0a1a0a";
  if (png.subarray(0, 8).toString("hex") !== signature) problems.push("flagship screenshot must be a PNG");
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width < 1200 || height < 800) problems.push(`flagship screenshot is too small: ${width}x${height}`);
} catch {
  problems.push("missing flagship screenshot: docs/assets/flagship-overview.png");
}

if (problems.length > 0) {
  console.error("Flagship proof policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Flagship proof policy passed: ${Object.keys(requiredText).length} written surfaces and one real UI capture.`);
