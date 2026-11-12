export const HBOX_BUILTIN_PROVIDER_CONFIG_FILE_ENV = "HBOX_BUILTIN_PROVIDER_CONFIG_FILE";
export const HBOX_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE_ENV =
  "HBOX_BUILTIN_PROVIDER_BUNDLED_CONFIG_FILE";
export const HBOX_PERSONAL_PROVIDER_CONFIG_FILE_ENV = "HBOX_PERSONAL_PROVIDER_CONFIG_FILE";
export const PERSONAL_PROVIDER_CONFIG_FILE_NAME = "provider_config.json";

export interface NodeProviderRuntimePaths {
  readonly hboxBuiltinFilePath: string;
  readonly personalFilePath: string;
}

export function createNodeProviderRuntimePathEnv(
  paths: NodeProviderRuntimePaths,
): Record<string, string> {
  return {
    [HBOX_BUILTIN_PROVIDER_CONFIG_FILE_ENV]: paths.hboxBuiltinFilePath,
    [HBOX_PERSONAL_PROVIDER_CONFIG_FILE_ENV]: paths.personalFilePath,
  };
}

export function resolveNodeProviderRuntimePaths(
  env: Readonly<Record<string, string | undefined>>,
): NodeProviderRuntimePaths | null {
  const hboxBuiltinFilePath = env[HBOX_BUILTIN_PROVIDER_CONFIG_FILE_ENV]?.trim();
  const personalFilePath = env[HBOX_PERSONAL_PROVIDER_CONFIG_FILE_ENV]?.trim();
  if (!hboxBuiltinFilePath && !personalFilePath) return null;
  if (!hboxBuiltinFilePath || !personalFilePath) {
    throw new Error("Hbox Built-in 与 Personal Provider Config 路径必须同时提供");
  }
  return Object.freeze({ hboxBuiltinFilePath, personalFilePath });
}
