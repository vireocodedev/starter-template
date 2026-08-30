import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const PWA_UPDATE_FIXTURE_ROOT = resolve(import.meta.dirname, "..", ".pwa-update-fixture");
export const PWA_UPDATE_REVISIONS = Object.freeze({ A: "revision-a", B: "revision-b" });
const selectorPath = resolve(PWA_UPDATE_FIXTURE_ROOT, "active-revision.txt");

export function pwaUpdateRevisionPath(revision) {
  const directory = PWA_UPDATE_REVISIONS[revision];
  if (!directory) throw new Error(`Unknown PWA fixture revision: ${revision}`);
  return resolve(PWA_UPDATE_FIXTURE_ROOT, directory);
}

export async function selectPwaFixtureRevision(revision) {
  pwaUpdateRevisionPath(revision);
  await writeFile(selectorPath, revision, "utf8");
}

export async function activePwaFixtureRevision() {
  const revision = (await readFile(selectorPath, "utf8")).trim();
  pwaUpdateRevisionPath(revision);
  return revision;
}
