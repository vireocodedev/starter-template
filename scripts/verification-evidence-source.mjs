function resolveGeneratedProjectSource(project) {
  if (
    !project ||
    typeof project !== "object" ||
    !/^[0-9a-f]{40}$/u.test(project.templateCommit ?? "") ||
    typeof project.projectName !== "string" ||
    project.projectName.trim().length === 0 ||
    !/^create-vireo@\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(
      project.createdBy ?? "",
    )
  ) {
    return null;
  }
  return {
    kind: "generated-project",
    head: null,
    commit: project.templateCommit,
    workflow: "local",
    runId: null,
    runAttempt: null,
    clean: null,
    authoritative: false,
    projectName: project.projectName,
    createdBy: project.createdBy,
  };
}

export function resolveVerificationEvidenceSource({
  env = {},
  command,
  project,
}) {
  if (typeof command !== "function")
    throw new Error(
      "Verification evidence source requires a Git command runner.",
    );
  const hosted = env.GITHUB_ACTIONS === "true";
  let head;
  let status;
  try {
    head = String(command("git", ["rev-parse", "HEAD"])).trim();
    status = String(
      command("git", ["status", "--porcelain", "--untracked-files=all"]),
    );
  } catch (error) {
    const generatedProject = hosted
      ? null
      : resolveGeneratedProjectSource(project);
    if (generatedProject) return { source: generatedProject, problems: [] };
    throw new Error(
      `Could not determine Git verification evidence source: ${error.message}`,
      { cause: error },
    );
  }
  if (!head)
    throw new Error(
      "Could not determine Git verification evidence source: HEAD is empty.",
    );
  const selectedSha =
    typeof env.GITHUB_SHA === "string" ? env.GITHUB_SHA.trim() : "";
  const commit = selectedSha || head;
  const clean = status.trim().length === 0;
  const problems = [];
  if (hosted && !selectedSha)
    problems.push(
      "GitHub Actions must provide a nonblank GITHUB_SHA for authoritative evidence.",
    );
  else if (hosted && selectedSha !== head)
    problems.push(
      `GitHub Actions selected commit ${selectedSha} does not match checked-out HEAD ${head}.`,
    );
  return {
    source: {
      kind: "git",
      head,
      commit,
      workflow: env.GITHUB_WORKFLOW || "local",
      runId: env.GITHUB_RUN_ID || null,
      runAttempt: env.GITHUB_RUN_ATTEMPT || null,
      clean,
      authoritative:
        hosted && Boolean(selectedSha) && selectedSha === head && clean,
    },
    problems,
  };
}
