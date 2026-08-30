import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { evaluateVireoPackageCompatibility } from "./vireo-package-compatibility.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
const contract = await readJson("contracts/vireo-package-compatibility.json");
const frontend = await readJson("frontend/package.json");
const problems = [];

if (contract.schemaVersion !== 1 || typeof contract.id !== "string") {
  problems.push(
    "The Vireo package compatibility contract must use schemaVersion 1 and have an id.",
  );
}

const current = evaluateVireoPackageCompatibility(
  frontend.dependencies,
  contract,
);
if (!current.compatible)
  problems.push(
    ...current.problems.map((problem) => `current manifest: ${problem}`),
  );

const independentPatch = evaluateVireoPackageCompatibility(
  { ...frontend.dependencies, "@vireocodedev/sqlite": "^0.2.2" },
  contract,
);
if (!independentPatch.compatible) {
  problems.push(
    "The supported independent SQLite patch fixture must be compatible.",
  );
}

const unsupportedLine = evaluateVireoPackageCompatibility(
  { ...frontend.dependencies, "@vireocodedev/ui": "^0.4.0" },
  contract,
);
if (unsupportedLine.compatible)
  problems.push("An unsupported UI release line must be rejected.");

if (problems.length > 0) {
  console.error("Vireo package compatibility policy failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Vireo package compatibility policy passed for ${contract.id}.`);
