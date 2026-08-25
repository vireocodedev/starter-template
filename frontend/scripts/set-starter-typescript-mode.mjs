import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
const projectByMode = {
  local: "./tsconfig.local-starter.json",
  published: "./tsconfig.app.json",
};

if (!(mode in projectByMode)) {
  throw new Error(`Unknown Starter TypeScript mode: ${mode ?? "<missing>"}`);
}

const configPath = fileURLToPath(new URL("../tsconfig.json", import.meta.url));
const config = JSON.parse(await readFile(configPath, "utf8"));
const nodeProject = config.references.find(reference => reference.path === "./tsconfig.node.json");

config.references = [{ path: projectByMode[mode] }, ...(nodeProject ? [nodeProject] : [])];

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Starter TypeScript mode: ${mode}`);
console.log(`VS Code project: ${projectByMode[mode]}`);
