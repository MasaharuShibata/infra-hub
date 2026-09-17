import { readFileSync, writeFileSync, existsSync } from "node:fs";

const STATE_PATH = new URL("../state.json", import.meta.url);

export function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { processedIssues: [] };
  }
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

export function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function markProcessed(state, issueNumber) {
  if (!state.processedIssues.includes(issueNumber)) {
    state.processedIssues.push(issueNumber);
  }
  saveState(state);
}
