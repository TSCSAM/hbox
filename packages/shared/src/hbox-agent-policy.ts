import { z } from "zod";
import type { CommandAgentSource } from "./command-types.js";
import type { HboxProvider } from "./hbox-task-types-core.js";

export const HBOX_AGENT_PROVIDER = "glm" satisfies HboxProvider;
export const HBOX_AGENT_PROVIDER_LABEL = "Hbox Agent";
export const HBOX_COMMAND_AGENT_SOURCE = "hboxAgent" satisfies CommandAgentSource;

/**
 * 解析持久化/relay 数据时的 provider 归一 schema：
 * 已移除的第三方 provider 历史值仅作为归一化输入保留，统一收敛为 glm；
 * 其它非法值保持拒绝，与收窄前的校验边界一致。
 */
export const legacyHboxProviderSchema = z
  .enum(["claude", "opencode", "gemini", "codex", "glm"])
  .transform((): typeof HBOX_AGENT_PROVIDER => HBOX_AGENT_PROVIDER);

export const HBOX_ENABLED_AGENT_PROVIDERS = [
  HBOX_AGENT_PROVIDER,
] as const satisfies readonly HboxProvider[];

export const HBOX_COMMAND_AGENT_SOURCES = [
  HBOX_COMMAND_AGENT_SOURCE,
] as const satisfies readonly CommandAgentSource[];

export function normalizeAgentProviderToHboxAgent(
  _provider?: HboxProvider | null,
): HboxProvider {
  return HBOX_AGENT_PROVIDER;
}

export function normalizeAgentProvidersToHboxAgent(
  _providers?: ReadonlyArray<HboxProvider> | null,
): HboxProvider[] {
  return [...HBOX_ENABLED_AGENT_PROVIDERS];
}

export function normalizeCommandAgentSourceToHboxAgent(
  _agentSource?: CommandAgentSource | null,
): CommandAgentSource {
  return HBOX_COMMAND_AGENT_SOURCE;
}

export function isHboxAgentProvider(
  provider: HboxProvider | null | undefined,
): provider is typeof HBOX_AGENT_PROVIDER {
  return provider === HBOX_AGENT_PROVIDER;
}
