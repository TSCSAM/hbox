import { DEFAULT_HBOX_ENDPOINT_ORIGIN } from "./hboxEndpoint.js";

export const HBOX_SOURCE_HEADERS = {
  "User-Agent": "Hbox/unknown",
  "HTTP-Referer": DEFAULT_HBOX_ENDPOINT_ORIGIN,
  "X-Title": "Z Code@electron",
} as const;

export interface BuildHboxSourceHeadersFromContextOptions {
  appVersion?: string;
  arch?: string;
  clientLanguage?: string;
  clientTimezone?: string;
  deviceMid?: string;
  endpointOrigin?: string;
  osVersion?: string;
  platform?: string;
  releaseChannel?: string;
  sourceTitle?: string;
}

export function normalizeHboxSourceHeaderValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^[\x20-\x7e]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function buildHboxSourceHeadersFromContext(
  options: BuildHboxSourceHeadersFromContextOptions = {},
): Record<string, string> {
  const appVersion = normalizeHboxSourceHeaderValue(options.appVersion);
  const arch = normalizeHboxSourceHeaderValue(options.arch);
  const clientLanguage = normalizeHboxSourceHeaderValue(options.clientLanguage) ?? "unknown";
  const clientTimezone = normalizeHboxSourceHeaderValue(options.clientTimezone) ?? "unknown";
  const deviceMid = normalizeHboxSourceHeaderValue(options.deviceMid);
  const endpointOrigin =
    normalizeHboxSourceHeaderValue(options.endpointOrigin) ?? DEFAULT_HBOX_ENDPOINT_ORIGIN;
  const osVersion = normalizeHboxSourceHeaderValue(options.osVersion);
  const platform = normalizeHboxSourceHeaderValue(options.platform);
  const releaseChannel = normalizeHboxSourceHeaderValue(options.releaseChannel);
  const sourceTitle = normalizeHboxSourceHeaderValue(options.sourceTitle) ?? "electron";

  return {
    ...HBOX_SOURCE_HEADERS,
    "HTTP-Referer": endpointOrigin,
    "User-Agent": `Hbox/${appVersion ?? "unknown"}`,
    ...(appVersion ? { "X-Hbox-App-Version": appVersion } : {}),
    "X-Title": `Z Code@${sourceTitle}`,
    ...(platform && arch ? { "X-Platform": `${platform}-${arch}` } : {}),
    ...(releaseChannel ? { "X-Release-Channel": releaseChannel } : {}),
    "X-Client-Language": clientLanguage,
    "X-Client-Timezone": clientTimezone,
    ...(platform ? { "X-Os-Category": normalizeOsCategory(platform) } : {}),
    ...(osVersion ? { "X-Os-Version": osVersion } : {}),
    ...(deviceMid ? { "X-Device-Mid": deviceMid } : {}),
  };
}

function normalizeOsCategory(platform: string): string {
  switch (platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}
