import type { HboxBackgroundTaskControlItem } from "./background-task-controls.js";

export function mergeHboxBackgroundTaskControlItems(
  current: readonly HboxBackgroundTaskControlItem[],
  updates: readonly HboxBackgroundTaskControlItem[],
): HboxBackgroundTaskControlItem[] {
  const jobsById = new Map(current.map((job) => [job.jobId, job] as const));
  for (const job of updates) {
    jobsById.set(job.jobId, job);
  }
  return Array.from(jobsById.values());
}
