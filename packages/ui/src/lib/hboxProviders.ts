import {
  HBOX_AGENT_PROVIDER,
  HBOX_AGENT_PROVIDER_LABEL,
  type HboxProvider,
} from "@hbox/shared";

export const HBOX_AGENT_PROVIDERS: HboxProvider[] = [HBOX_AGENT_PROVIDER];

export const HBOX_AGENT_PROVIDER_LABELS: Record<HboxProvider, string> = {
  glm: HBOX_AGENT_PROVIDER_LABEL,
};

export function supportsHboxSessionFork(provider: HboxProvider): boolean {
  void provider;
  // 功能开关：fork 入口恢复对所有 Hbox provider 开放；实际可操作性仍由 task 状态、
  // assistant 目标和运行中保护 guard 控制，避免把 active/failed 分支暴露为可 fork。
  return true;
}

export function shouldHideHboxSessionForkAction(provider: HboxProvider): boolean {
  return !supportsHboxSessionFork(provider);
}
