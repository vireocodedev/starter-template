import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = path.join(frontendRoot, "dist", "assets");
const largestChunkBudget = 700 * 1024;
const totalJavaScriptBudget = 2400 * 1024;

if (!fs.existsSync(assetsDirectory)) {
  console.error("Bundle budget check requires a completed Vite build in dist/assets.");
  process.exit(1);
}

const chunks = fs
  .readdirSync(assetsDirectory)
  .filter(fileName => fileName.endsWith(".js"))
  .map(fileName => ({ fileName, bytes: fs.statSync(path.join(assetsDirectory, fileName)).size }))
  .sort((left, right) => right.bytes - left.bytes);

const largestChunk = chunks[0];
const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
const problems = [];

if (!largestChunk) problems.push("No JavaScript chunks were emitted.");
if (largestChunk && largestChunk.bytes > largestChunkBudget) {
  problems.push(
    `Largest chunk ${largestChunk.fileName} is ${formatKiB(largestChunk.bytes)}; budget is ${formatKiB(largestChunkBudget)}.`,
  );
}
if (totalBytes > totalJavaScriptBudget) {
  problems.push(`Total JavaScript is ${formatKiB(totalBytes)}; budget is ${formatKiB(totalJavaScriptBudget)}.`);
}

if (problems.length > 0) {
  console.error("Bundle budget check failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Bundle budget passed: ${formatKiB(totalBytes)} total; largest chunk ${largestChunk.fileName} is ${formatKiB(largestChunk.bytes)}.`,
);

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
