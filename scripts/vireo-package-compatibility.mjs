export function evaluateVireoPackageCompatibility(dependencies, contract) {
  const declared = Object.entries(dependencies ?? {}).filter(([name]) =>
    name.startsWith("@vireocodedev/"),
  );
  const problems = [];

  if (declared.length === 0)
    problems.push("No Vireo frontend packages are declared.");

  for (const [name, declaration] of declared) {
    const allowed = contract.packages?.[name];
    if (!Array.isArray(allowed)) {
      problems.push(`${name} is not part of compatibility set ${contract.id}.`);
    } else if (!allowed.includes(declaration)) {
      problems.push(
        `${name} ${declaration} is unsupported; expected one of ${allowed.join(", ")}.`,
      );
    }
  }

  return { compatible: problems.length === 0, problems };
}

function vireoPackageNameFromLockPath(packagePath) {
  const marker = "node_modules/";
  const offset = packagePath.lastIndexOf(marker);
  if (offset === -1) return undefined;

  const name = packagePath.slice(offset + marker.length);
  return name.startsWith("@vireocodedev/") &&
    !name.slice("@vireocodedev/".length).includes("/")
    ? name
    : undefined;
}

function expectedRegistryTarball(name, version) {
  return `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${version}.tgz`;
}

/**
 * Verifies that the committed npm lock is the exact public Vireo package set that
 * the Template release contract declares. Ranges alone cannot provide this
 * guarantee because npm correctly retains an older semver-compatible lock entry.
 */
export function evaluateVireoPackageLockCompatibility({
  dependencies,
  lock,
  contract,
}) {
  const problems = [];
  const lockedPackages = contract.lockedPackages;
  if (
    !lockedPackages ||
    typeof lockedPackages !== "object" ||
    Array.isArray(lockedPackages)
  ) {
    return {
      compatible: false,
      problems: ["Compatibility contract must declare lockedPackages."],
    };
  }

  const rootDependencies = lock?.packages?.[""]?.dependencies;
  if (!rootDependencies || typeof rootDependencies !== "object")
    problems.push("package-lock root dependencies are missing.");

  const declaredPackages = Object.entries(dependencies ?? {}).filter(([name]) =>
    name.startsWith("@vireocodedev/"),
  );
  for (const [name, declaration] of declaredPackages) {
    if (rootDependencies?.[name] !== declaration)
      problems.push(
        `${name} root lock declaration must match frontend/package.json.`,
      );
    if (!lockedPackages[name])
      problems.push(`${name} must declare an exact locked Vireo coordinate.`);
    if (!lock?.packages?.[`node_modules/${name}`])
      problems.push(
        `${name} is missing its canonical top-level package-lock entry.`,
      );
  }

  for (const name of Object.keys(lockedPackages)) {
    if (!(name in (dependencies ?? {})))
      problems.push(
        `${name} is locked but not declared by frontend/package.json.`,
      );
  }

  const seen = new Set();
  for (const [packagePath, entry] of Object.entries(lock?.packages ?? {})) {
    const name = vireoPackageNameFromLockPath(packagePath);
    if (!name) continue;

    const expectedVersion = lockedPackages[name];
    if (!expectedVersion) {
      problems.push(
        `${name} at ${packagePath} is not an expected locked Vireo coordinate.`,
      );
      continue;
    }
    seen.add(name);
    if (entry?.link === true)
      problems.push(
        `${name} at ${packagePath} must not be a linked local package.`,
      );
    if (entry?.version !== expectedVersion)
      problems.push(
        `${name} at ${packagePath} resolves ${entry?.version}; expected ${expectedVersion}.`,
      );
    if (entry?.resolved !== expectedRegistryTarball(name, expectedVersion))
      problems.push(
        `${name} at ${packagePath} must resolve from its exact public npm tarball.`,
      );
    if (
      typeof entry?.integrity !== "string" ||
      !entry.integrity.startsWith("sha512-")
    )
      problems.push(
        `${name} at ${packagePath} must retain a sha512 npm integrity.`,
      );
  }

  for (const name of Object.keys(lockedPackages)) {
    if (!seen.has(name))
      problems.push(`${name} is missing from the committed package lock.`);
  }

  return { compatible: problems.length === 0, problems };
}
