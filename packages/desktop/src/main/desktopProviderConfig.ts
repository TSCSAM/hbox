import { app } from "electron";
import { join } from "node:path";
import { HBOX_ENV } from "@hbox/shared";

export function resolveHboxBuiltinProviderConfigFilePath(options?: {
  readonly appPath?: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly isPackaged?: boolean;
  readonly resourcesPath?: string;
}): string {
  const explicitPath = (options?.env ?? process.env)["HBOX_BUILTIN_PROVIDER_CONFIG_FILE"]?.trim();
  if (explicitPath) return explicitPath;
  if (options?.isPackaged ?? app.isPackaged) {
    return join(
      options?.resourcesPath ?? process.resourcesPath,
      "config/provider/hbox-builtin.json",
    );
  }
  // 开发态没有 resources 复制步骤，必须与构建注入的产品环境读取同一份源文件。
  const filename = HBOX_ENV === "production" ? "hbox-builtin.json" : "hbox-builtin.test.json";
  return join(options?.appPath ?? app.getAppPath(), "../../config/provider", filename);
}
