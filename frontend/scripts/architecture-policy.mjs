const appFeatureCompositionFiles = new Set([
  "app/adapters/app.adapters.ts",
  "app/adapters/mock/app.mock-adapters.ts",
  "app/adapters/public.ts",
  "app/app.localization.ts",
]);

const generatedRegistryConsumers = new Set(["app/app.localization.ts", "app/app.pages.ts"]);

export function mayAppImportFeature(relativeFile) {
  return appFeatureCompositionFiles.has(relativeFile.replaceAll("\\", "/"));
}

export function mayImportGeneratedRegistry(relativeFile) {
  const normalized = relativeFile.replaceAll("\\", "/");
  return normalized.startsWith("generated/") || generatedRegistryConsumers.has(normalized);
}
