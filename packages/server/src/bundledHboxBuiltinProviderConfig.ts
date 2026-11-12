import { materializeHboxBuiltinProviderConfig } from "@hbox/services/node";

declare const __HBOX_BUILTIN_PROVIDER_CONFIG_JSON__: string | undefined;

export interface MaterializeBundledHboxBuiltinProviderConfigOptions {
  readonly environmentConfigRoot: string;
  readonly content: string;
}

/** 返回构建时嵌入远端 Server 的 Hbox Built-in Provider Config。 */
export function readBundledHboxBuiltinProviderConfig(): string {
  if (typeof __HBOX_BUILTIN_PROVIDER_CONFIG_JSON__ !== "string") {
    throw new Error("当前构建未嵌入 Hbox Built-in Provider Config");
  }
  return __HBOX_BUILTIN_PROVIDER_CONFIG_JSON__;
}

/**
 * 将 Hbox Built-in Config 原子物化到所属环境的固定资源副本。
 * 升级前退出旧进程；不保留按内容 hash 增长的历史文件。
 */
export async function materializeBundledHboxBuiltinProviderConfig(
  options: MaterializeBundledHboxBuiltinProviderConfigOptions,
): Promise<string> {
  return materializeHboxBuiltinProviderConfig(options);
}
