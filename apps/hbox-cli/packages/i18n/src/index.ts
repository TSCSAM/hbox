import type { UiLocale, SupportedLocale } from "@hbox/contracts";
import { enUS } from "./locales/en-US.js";
import { zhCN } from "./locales/zh-CN.js";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "./locale.js";
import type { HboxCopy } from "./types.js";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocale,
  isSupportedLocale,
  isUiLocale,
  resolveLocale,
};
export type { LocaleDetectionInput } from "./locale.js";
export type { CliCopy, TuiCopy, UiLocale, SupportedLocale, HboxCopy } from "./types.js";

const CATALOGS: Record<SupportedLocale, HboxCopy> = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export function getHboxCopy(locale?: UiLocale | string, detected?: string | null): HboxCopy {
  return CATALOGS[resolveLocale(locale, detected)];
}
