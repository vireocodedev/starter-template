import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "src");
const errors = [];

const allowedSourceEntries = new Set(["@types", "app", "features", "pages", "main.css", "main.tsx", "vite-env.d.ts"]);
const allowedFeatureDirectories = new Set([
  "api",
  "assets",
  "components",
  "config",
  "contexts",
  "hooks",
  "localization",
  "models",
  "offline",
  "providers",
  "services",
  "state",
  "storybook",
  "tests",
]);
const forbiddenDirectoryNames = new Set(["common", "helpers", "shared", "utils"]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}

for (const entry of await readdir(sourceRoot)) {
  if (!allowedSourceEntries.has(entry)) errors.push(`Unexpected src entry: ${entry}`);
}

const featureRoot = path.join(sourceRoot, "features");
for (const featureName of await readdir(featureRoot)) {
  const featurePath = path.join(featureRoot, featureName);
  if (!(await stat(featurePath)).isDirectory()) {
    errors.push(`Features may contain only capability directories: ${featureName}`);
    continue;
  }

  const featureEntries = await readdir(featurePath, { withFileTypes: true });
  if (!featureEntries.some(entry => entry.isFile() && entry.name === "public.ts")) {
    errors.push(`Feature ${featureName} is missing its root public.ts`);
  }

  for (const entry of featureEntries) {
    if (entry.isFile() && entry.name !== "public.ts") {
      errors.push(`Feature ${featureName} has a root file other than public.ts: ${entry.name}`);
    }
    if (entry.isDirectory() && !allowedFeatureDirectories.has(entry.name)) {
      errors.push(`Feature ${featureName} has a non-standard directory: ${entry.name}`);
    }
  }
}

const sourceFiles = (await filesBelow(sourceRoot)).filter(file => /\.[cm]?[jt]sx?$/.test(file));
const sourceDirectories = (await filesBelow(sourceRoot)).map(file => path.dirname(file));
const featureImportPattern = /(?:from\s+|import\s*\()\s*["']@\/features\/([^/"']+)([^"']*)["']/g;
const pageImportPattern = /(?:from\s+|import\s*\()\s*["']@\/pages\/([^"']+)["']/g;

for (const directory of new Set(sourceDirectories)) {
  const segments = path.relative(sourceRoot, directory).split(path.sep);
  const forbiddenSegment = segments.find(segment => forbiddenDirectoryNames.has(segment));
  if (forbiddenSegment) {
    errors.push(`${path.relative(sourceRoot, directory)} uses forbidden dumping-ground directory ${forbiddenSegment}`);
  }
}

for (const pageName of await readdir(path.join(sourceRoot, "pages"))) {
  const pagePath = path.join(sourceRoot, "pages", pageName);
  if (!(await stat(pagePath)).isDirectory()) {
    errors.push(`Pages may contain only route directories: ${pageName}`);
    continue;
  }

  const hasRouteComponent = (await readdir(pagePath)).some(name => /^AppPage.+\.tsx$/.test(name));
  if (!hasRouteComponent) errors.push(`Page ${pageName} is missing a direct AppPage*.tsx route component`);
}

for (const file of sourceFiles) {
  const relativeFile = path.relative(sourceRoot, file);
  const ownFeature = relativeFile.startsWith(`features${path.sep}`) ? relativeFile.split(path.sep)[1] : undefined;
  const source = await readFile(file, "utf8");

  if (/\/index\.[cm]?[jt]sx?$/.test(file.replaceAll(path.sep, "/"))) {
    errors.push(`${relativeFile} is an index barrel; use an explicit file or feature public.ts`);
  }

  for (const match of source.matchAll(featureImportPattern)) {
    const importedFeature = match[1];
    const importedSuffix = match[2];
    if (ownFeature === importedFeature) {
      errors.push(`${relativeFile} imports its own feature through @; use a relative import`);
      continue;
    }

    const isPublicImport = importedSuffix === "/public";
    const isLocalizationRegistryImport =
      relativeFile === "app/app.localization.ts" && importedSuffix.startsWith("/localization/resources/");

    if (!isPublicImport && !isLocalizationRegistryImport) {
      errors.push(
        `${relativeFile} reaches into feature ${importedFeature}; import @/features/${importedFeature}/public`,
      );
    }
  }

  for (const _match of source.matchAll(pageImportPattern)) {
    const isRouteRegistry = relativeFile === "app/app.pages.ts";
    const isLocalizationRegistryImport =
      relativeFile === "app/app.localization.ts" && _match[1].includes("/localization/resources/");
    if (!isRouteRegistry && !isLocalizationRegistryImport) {
      errors.push(
        `${relativeFile} imports a page outside an allowed composition boundary; routes belong in app/app.pages.ts and translation resources in app/app.localization.ts`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Architecture contract violations:\n");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Architecture contract passed.");
