export function resolveVerificationEvidenceSource({ env = {}, command }) {
  if (typeof command !== "function") throw new Error("Verification evidence source requires a Git command runner.");
  let head;
  let status;
  try {
    head = String(command("git", ["rev-parse", "HEAD"])).trim();
    status = String(command("git", ["status", "--porcelain", "--untracked-files=all"]));
  } catch (error) {
    throw new Error(`Could not determine Git verification evidence source: ${error.message}`, { cause: error });
  }
  if (!head) throw new Error("Could not determine Git verification evidence source: HEAD is empty.");
  const hosted = env.GITHUB_ACTIONS === "true";
  const selectedSha = typeof env.GITHUB_SHA === "string" ? env.GITHUB_SHA.trim() : "";
  const commit = selectedSha || head;
  const clean = status.trim().length === 0;
  const problems = [];
  if (hosted && !selectedSha) problems.push("GitHub Actions must provide a nonblank GITHUB_SHA for authoritative evidence.");
  else if (hosted && selectedSha !== head) problems.push(`GitHub Actions selected commit ${selectedSha} does not match checked-out HEAD ${head}.`);
  return { source: { head, commit, workflow: env.GITHUB_WORKFLOW || "local", runId: env.GITHUB_RUN_ID || null, runAttempt: env.GITHUB_RUN_ATTEMPT || null, clean, authoritative: hosted && Boolean(selectedSha) && selectedSha === head && clean }, problems };
}
