const HBOX_PROCESS_PREFIX = "hbox";
const MAX_PROCESS_NAME_SEGMENT_LENGTH = 24;

function sanitizeProcessNameSegment(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, MAX_PROCESS_NAME_SEGMENT_LENGTH);
}

function joinHboxProcessName(...segments: Array<string | null | undefined>): string {
  const sanitizedSegments = segments
    .map((segment) => sanitizeProcessNameSegment(segment))
    .filter((segment): segment is string => Boolean(segment));
  return [HBOX_PROCESS_PREFIX, ...sanitizedSegments].join("-");
}

function pickWorkspaceTag(workspacePath: string | null | undefined): string | undefined {
  const trimmedPath = workspacePath?.trim();
  if (!trimmedPath) {
    return undefined;
  }

  const parts = trimmedPath.split(/[\\/]+/).filter(Boolean);
  return parts.at(-1) ?? trimmedPath;
}

export function formatHboxMainProcessName(): string {
  return joinHboxProcessName("main");
}

export function formatHboxGpuProcessName(): string {
  return joinHboxProcessName("gpu");
}

export function formatHboxHostProcessName(label?: string): string {
  return joinHboxProcessName("host", label);
}

export function formatHboxRendererProcessName(windowTitle?: string): string {
  const normalizedTitle = windowTitle?.trim();
  if (!normalizedTitle || normalizedTitle === "Hbox") {
    return joinHboxProcessName("renderer", "main");
  }

  if (normalizedTitle === "Resource Manager") {
    return joinHboxProcessName("renderer", "resource-manager");
  }

  const remoteWindowPrefix = "Hbox - ";
  if (normalizedTitle.startsWith(remoteWindowPrefix)) {
    return joinHboxProcessName(
      "renderer",
      "remote",
      normalizedTitle.slice(remoteWindowPrefix.length),
    );
  }

  return joinHboxProcessName("renderer", normalizedTitle);
}

export function formatHboxAgentProcessName(provider: string, workspacePath?: string): string {
  return joinHboxProcessName("agent", provider, pickWorkspaceTag(workspacePath));
}

export function formatHboxUtilityProcessName(name?: string, type = "utility"): string {
  return joinHboxProcessName(type, name);
}
