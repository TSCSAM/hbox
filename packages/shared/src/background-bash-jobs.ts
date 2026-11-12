import {
  collectVisibleHboxBackgroundTaskControlItems,
  getHboxBackgroundTaskControlItemElapsedMs,
  isActiveHboxBackgroundTaskControlItem,
  parseHboxBackgroundTaskControlItems,
  type HboxBackgroundTaskControlItem,
  type HboxBackgroundTaskControlStatus,
} from "./background-task-controls.js";

export type HboxBackgroundBashJobStatus = HboxBackgroundTaskControlStatus;
export type HboxBackgroundBashJob = HboxBackgroundTaskControlItem & {
  taskKind: "bash";
};

export function parseHboxBackgroundBashJobs(value: unknown): HboxBackgroundBashJob[] {
  return parseHboxBackgroundTaskControlItems(value).filter(isBackgroundBashJob);
}

export function isActiveHboxBackgroundBashJob(job: HboxBackgroundBashJob): boolean {
  return isActiveHboxBackgroundTaskControlItem(job);
}

export function getHboxBackgroundBashJobElapsedMs(
  job: HboxBackgroundBashJob,
  now = Date.now(),
): number {
  return getHboxBackgroundTaskControlItemElapsedMs(job, now);
}

export function collectVisibleHboxBackgroundBashJobs(
  jobs: readonly HboxBackgroundBashJob[],
  now = Date.now(),
  thresholdMs = 30_000,
): Array<HboxBackgroundBashJob & { elapsedMs: number }> {
  return collectVisibleHboxBackgroundTaskControlItems(jobs, now, thresholdMs) as Array<
    HboxBackgroundBashJob & { elapsedMs: number }
  >;
}

function isBackgroundBashJob(job: HboxBackgroundTaskControlItem): job is HboxBackgroundBashJob {
  return job.taskKind === "bash";
}
