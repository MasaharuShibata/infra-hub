import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  githubToken: required("GITHUB_TOKEN"),
  owner: required("GITHUB_OWNER"),
  repo: required("GITHUB_REPO"),
  repoPath: required("REPO_PATH"),
  baseBranch: process.env.BASE_BRANCH || "main",
  targetLabel: process.env.TARGET_LABEL || "claude-task",
  doneLabel: process.env.DONE_LABEL || "claude-done",
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 60000),
};
