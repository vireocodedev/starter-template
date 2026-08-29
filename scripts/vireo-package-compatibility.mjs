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
