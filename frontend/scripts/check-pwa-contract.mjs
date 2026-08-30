import { resolve } from "node:path";
import { checkPwaBuiltContract, checkPwaSourceContract, formatPwaContractProblems } from "./pwa-contract.mjs";

const frontendRoot = resolve(import.meta.dirname, "..");
const mode = process.argv.includes("--built") ? "built" : "source";
const problems =
  mode === "built"
    ? checkPwaBuiltContract({ frontendRoot, distRoot: resolve(frontendRoot, "dist") })
    : checkPwaSourceContract({ frontendRoot, requireNginx: process.argv.includes("--require-nginx") });

if (problems.length > 0) {
  console.error(`PWA ${mode} contract failed:\n${formatPwaContractProblems(problems)}`);
  process.exitCode = 1;
} else {
  console.log(`PWA ${mode} contract passed.`);
}
