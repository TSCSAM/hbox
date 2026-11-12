import { getHboxCopy, type SupportedLocale, type UiLocale } from "@hbox/i18n";

export function formatCliHelp(
  version: string,
  locale?: UiLocale,
  detectedLocale?: SupportedLocale,
): string {
  return getHboxCopy(locale, detectedLocale).cli.help(version);
}
