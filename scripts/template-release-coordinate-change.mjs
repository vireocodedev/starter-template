import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { hasTemplateReleaseCoordinateChange } from "./template-release-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [beforePath] = process.argv.slice(2);
if (!beforePath) throw new Error("previous release policy path is required");
const before = JSON.parse(readFileSync(beforePath, "utf8"));
const after = JSON.parse(
  readFileSync(join(root, "contracts/template-release-policy.json"), "utf8"),
);
process.stdout.write(
  `${hasTemplateReleaseCoordinateChange(before, after) ? "true" : "false"}\n`,
);
