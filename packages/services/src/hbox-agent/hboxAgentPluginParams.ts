import type {
  ModelSelection,
  HboxAgentMcpServer,
  HboxAutomationScheduleRule,
  HboxMcpListMode,
} from "@hbox/shared";
import type { McpAppsAppToolCallResult, McpAppsAppToolDescriptor } from "@hbox/shared/mcp-apps";

export interface HboxAgentWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  /** 远程 workspace 的运行时会话身份；只用于隔离/路由，不能替代 workspacePath。 */
  remoteSessionId?: string;
}

export interface HboxAgentPluginMutationTarget extends HboxAgentWorkspaceTarget {
  /** 仅 Host 观测使用；不会传给 CLI。 */
  telemetry?: {
    entry?:
      | "store_list"
      | "store_detail"
      | "side_pane_market"
      | "recommended_prompt"
      | "recommended_ui"
      | "component_settings";
    client_kind?: "desktop" | "mobile";
    trigger?: "user" | "automatic" | "dependency" | "restore" | "sync";
  };
}

export interface HboxAgentPluginViewParams extends HboxAgentWorkspaceTarget {
  configScope?: "user" | "workspace";
}

export interface HboxAgentListMcpServerStatusesParams extends HboxAgentWorkspaceTarget {
  mcpServers?: HboxAgentMcpServer[];
  mode?: HboxMcpListMode;
}

export interface HboxAgentAddPluginMarketplaceParams extends HboxAgentPluginMutationTarget {
  dryRun?: boolean;
  operationId?: string;
  source: string;
}

export interface HboxAgentRemovePluginMarketplaceParams extends HboxAgentPluginMutationTarget {
  marketplace: string;
}

export interface HboxAgentUpdatePluginMarketplaceParams extends HboxAgentPluginMutationTarget {
  marketplace?: string;
  operationId?: string;
}

export interface HboxAgentInstallPluginParams extends HboxAgentPluginMutationTarget {
  dryRun?: boolean;
  marketplace: string;
  operationId?: string;
  pluginName: string;
  scope?: "user" | "workspace";
}

export interface HboxAgentCancelPluginOperationParams {
  operationId: string;
}

export interface HboxAgentUninstallPluginParams extends HboxAgentPluginMutationTarget {
  marketplace?: string;
  pluginId?: string;
  pluginName?: string;
  removeCache?: boolean;
}

export interface HboxAgentUpdatePluginParams extends HboxAgentPluginMutationTarget {
  pluginId?: string;
  marketplace?: string;
}

export interface HboxAgentRestoreBuiltinPluginParams extends HboxAgentPluginMutationTarget {
  pluginId: string;
}

export interface HboxAgentConfigurePluginParams extends HboxAgentPluginMutationTarget {
  clearOptionKeys?: string[];
  dryRun?: boolean;
  options: Record<string, unknown>;
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface HboxAgentResetPluginConfigParams extends HboxAgentPluginMutationTarget {
  pluginId: string;
  scope?: "user" | "workspace";
}

export interface HboxAgentValidatePluginParams extends HboxAgentWorkspaceTarget {
  marketplace?: string;
  pluginName?: string;
  source?: string;
}

export interface HboxAgentDescribePluginParams extends HboxAgentWorkspaceTarget {
  marketplace: string;
  pluginName: string;
}

export interface HboxAgentSetPluginEnabledParams extends HboxAgentPluginMutationTarget {
  enabled: boolean;
  operationId?: string;
  pluginId: string;
  scope?: "user" | "workspace";
}

// Plugin 对话引用 catalog：
// 带 sessionId → session-owned 冻结 catalog（必须路由到持有该 session 的 workspace client）；
// 不带 → workspace 当前 catalog（新建草稿 Picker）。
export interface HboxAgentPluginReferenceCatalogParams extends HboxAgentWorkspaceTarget {
  sessionId?: string;
}

// Composer Skill catalog：与 Plugin 引用相同，以 sessionId 区分 workspace 当前目录和
// resident Session runtime 快照；不参与 Settings 管理目录。
export interface HboxAgentSkillReferenceCatalogParams extends HboxAgentWorkspaceTarget {
  sessionId?: string;
}

/** 插件 UI：UI 发起的 `ui://` 资源读取。 */
export interface HboxAgentReadMcpResourceParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  uri: string;
}

/** 插件 UI 页面发起的 `resources/read`；参数与 readMcpResource 同形，结果受 8 MiB 与 mimeType 白名单约束。 */
export type HboxAgentReadMcpResourceForUiParams = HboxAgentReadMcpResourceParams;

/** 插件 UI：UI 回调本插件工具；不进审批流，归属由 agent 侧 catalog fail closed。 */
export interface HboxAgentCallMcpToolForUiParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  toolName: string;
  arguments?: Record<string, unknown>;
  /** 宿主生成的调用 id，配合 cancelMcpToolCallForUi。 */
  callId: string;
}
/** 插件 UI 页面发起的 resources/list、resources/templates/list、subscribe、unsubscribe。 */
export interface HboxAgentListMcpResourcesForUiParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  cursor?: string;
}
/** App-Provided Tools：实例身份 = 会话 + 沙箱作用域 + 代际。 */
export interface HboxAgentAppToolInstanceForUiParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  scopeId: string;
  generation: number;
}
export interface HboxAgentRegisterAppToolsForUiParams extends HboxAgentAppToolInstanceForUiParams {
  tools: McpAppsAppToolDescriptor[];
}
export interface HboxAgentAppToolCallForUiParams extends HboxAgentAppToolInstanceForUiParams {
  callId: string;
}
export interface HboxAgentResolveAppToolCallForUiParams extends HboxAgentAppToolCallForUiParams {
  result?: McpAppsAppToolCallResult;
  error?: { message: string };
}
export interface HboxAgentMcpResourceSubscriptionForUiParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  scopeId: string;
  generation: number;
  uri: string;
}
export interface HboxAgentCancelMcpToolCallForUiParams extends HboxAgentWorkspaceTarget {
  instance: import("@hbox/shared/mcp-apps").McpAppInstance;
  sessionId: string;
  pluginId: string;
  serverName: string;
  callId: string;
}
export interface HboxAgentResolveSuggestedPluginReferenceParams extends HboxAgentWorkspaceTarget {
  stableId: string;
  operationId: string;
  clientMode: "desktop-continuous" | "web-remote-replayable";
  deliveryKind: "desktop-continuous" | "web-remote-replayable";
}

// ---- 定时任务(automation)管理参数 ----

export interface HboxAgentCreateAutomationParams extends HboxAgentWorkspaceTarget {
  projectId?: string | null;
  title: string;
  cronExpr: string;
  relativeDelayMinutes?: number;
  prompt: string;
  modelSelection?: ModelSelection;
  mode?: string;
  recurring?: boolean;
  maxRuns?: number;
  endAt?: number;
  scheduleRule?: HboxAutomationScheduleRule;
}

export interface HboxAgentUpdateAutomationParams extends HboxAgentWorkspaceTarget {
  automationId: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  modelSelection?: ModelSelection | null;
  mode?: string | null;
  recurring?: boolean;
  maxRuns?: number | null;
  endAt?: number | null;
  scheduleRule?: HboxAutomationScheduleRule | null;
  scheduleEditedByUser?: boolean;
}

export interface HboxAgentAutomationIdParams extends HboxAgentWorkspaceTarget {
  automationId: string;
}

export interface HboxAgentSetAutomationEnabledParams extends HboxAgentWorkspaceTarget {
  automationId: string;
  enabled: boolean;
}

export interface HboxAgentDeleteAutomationRunParams extends HboxAgentWorkspaceTarget {
  runId: string;
}
