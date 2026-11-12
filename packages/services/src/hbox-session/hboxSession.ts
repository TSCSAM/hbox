import { ServiceChannels } from "@hbox/shared";
import type {
  TraceId,
  HboxAgentMcpServer,
  HboxDeliveryKind,
  HboxMessageWithParts,
  ModelSelection,
  HboxPermissionRequestParams,
  HboxProviderRuntimeHeadersRequestParams,
  HboxUserInputRequestParams,
  HboxUserInputResponse,
  HboxSessionInfo,
  HboxSessionImportHistory,
  HboxSessionEvent,
  HboxSessionMode,
  HboxSessionPersistence,
  HboxSessionStateSnapshot,
  HboxStateUpdatedNotification,
  HboxWorkspacePresentation,
} from "@hbox/shared";
import { createServiceDescriptor } from "#src/descriptors.js";
import type { ProviderRuntimeHeadersUiResponse } from "#src/hbox-agent/hboxAgent.js";

export interface HboxSessionWorkspaceTarget {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export type HboxSessionReadWorkspacePresentationParams = HboxSessionWorkspaceTarget;

export interface HboxTaskTarget extends HboxSessionWorkspaceTarget {
  sessionId: string;
}

export interface HboxSessionCreateParams extends HboxSessionWorkspaceTarget {
  /** 仅导入事务使用的预分配 ID；普通新会话继续由 Agent 分配。 */
  sessionId?: string;
  sessionTraceId?: TraceId;
  parentSessionId?: string;
  mode?: HboxSessionMode;
  model?: ModelSelection;
  persistence?: HboxSessionPersistence;
  thoughtLevel?: string;
  mcpServers?: HboxAgentMcpServer[];
  importedHistory?: HboxSessionImportHistory;
}

export interface HboxSessionResumeParams extends HboxTaskTarget {
  model?: ModelSelection;
  thoughtLevel?: string;
  mcpServers?: HboxAgentMcpServer[];
  /**
   * 默认广播 resume 得到的历史快照，并让 shadow 订阅请求初始 snapshot。
   * 续聊发送前的 runtime 预恢复会关闭它，避免旧终态快照覆盖本地已开始的新输入运行态。
   */
  broadcastSnapshot?: boolean;
}

export interface HboxSessionListParams extends HboxSessionWorkspaceTarget {
  limit?: number;
}

export interface HboxSessionReadParams extends HboxTaskTarget {
  deliveryKind?: HboxDeliveryKind;
  messageLimit?: number;
  afterSeq?: number;
}

export interface HboxSessionMessagesParams extends HboxTaskTarget {
  afterMessageId?: string;
  limit?: number;
}

export interface HboxSessionEventsParams extends HboxTaskTarget {
  afterSeq?: number;
  limit?: number;
}

export interface HboxSessionSetModelParams extends HboxTaskTarget {
  model: ModelSelection;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface HboxSessionSetThoughtLevelParams extends HboxTaskTarget {
  thoughtLevel?: string;
  expectedRevision?: number;
  persistAsWorkspaceLastUsed?: boolean;
}

export interface HboxSessionSetModeParams extends HboxTaskTarget {
  mode: HboxSessionMode;
  expectedRevision?: number;
}

export interface HboxSessionRespondProviderRuntimeHeadersParams extends HboxTaskTarget {
  requestId: string;
  response: ProviderRuntimeHeadersUiResponse;
}

export interface HboxSessionSubscribeParams extends HboxTaskTarget {
  deliveryKind: HboxDeliveryKind;
  afterSeq?: number;
  includeSnapshot?: boolean;
  eventCoalescing?: {
    mode: "background-summary";
    intervalMs?: number;
  };
}

export type HboxSessionServiceEvent =
  | { type: "session.event"; event: HboxSessionEvent }
  | { type: "state.updated"; notification: HboxStateUpdatedNotification }
  | { type: "permission.request"; request: HboxPermissionRequestParams }
  | { type: "userInput.request"; request: HboxUserInputRequestParams }
  | {
      type: "userInput.response";
      requestId: string;
      response: HboxUserInputResponse;
    }
  | { type: "providerRuntimeHeaders.request"; request: HboxProviderRuntimeHeadersRequestParams }
  | { type: "snapshot"; snapshot: HboxSessionStateSnapshot };

export interface HboxSessionInitializeResult {
  available: boolean;
  workspaceKey: string;
  protocolName?: string;
  protocolVersion?: number;
  transportKind?: "stdio" | "websocket";
  reason?: string;
  reasonCode?: "provider_not_ready";
}

export interface HboxSessionWorkspaceRuntimeIdentity {
  generation: number;
  identity: string;
  processId?: number;
  workspaceKey: string;
}

export interface IHboxSessionService {
  initializeWorkspace(params: HboxSessionWorkspaceTarget): Promise<HboxSessionInitializeResult>;
  getWorkspaceRuntimeIdentity(
    params: HboxSessionWorkspaceTarget,
  ): Promise<HboxSessionWorkspaceRuntimeIdentity>;
  readWorkspacePresentation(
    params: HboxSessionReadWorkspacePresentationParams,
  ): Promise<HboxWorkspacePresentation>;
  createSession(params: HboxSessionCreateParams): Promise<HboxSessionStateSnapshot>;
  resumeSession(params: HboxSessionResumeParams): Promise<HboxSessionStateSnapshot>;
  listSessions(params: HboxSessionListParams): Promise<HboxSessionInfo[]>;
  readSession(params: HboxSessionReadParams): Promise<HboxSessionStateSnapshot>;
  readSessionMessages(params: HboxSessionMessagesParams): Promise<HboxMessageWithParts[]>;
  readSessionEvents(params: HboxSessionEventsParams): Promise<HboxSessionEvent[]>;
  promoteDeferredDraftSession(params: HboxTaskTarget): Promise<void>;
  closeSession(params: HboxTaskTarget): Promise<void>;
  closeDeferredDraftSession(params: HboxTaskTarget): Promise<boolean>;
  setModel(params: HboxSessionSetModelParams): Promise<HboxSessionStateSnapshot>;
  setThoughtLevel(params: HboxSessionSetThoughtLevelParams): Promise<HboxSessionStateSnapshot>;
  setMode(params: HboxSessionSetModeParams): Promise<HboxSessionStateSnapshot>;
  respondProviderRuntimeHeaders(
    params: HboxSessionRespondProviderRuntimeHeadersParams,
  ): Promise<void>;
  // M5 删波次 2：onDynamicSessionEvent（旧 session/subscribe 词表的 renderer 订阅面）
  // 已删除——v4 UI 走 agentService 的 conversation/sessions-index 帧通道，
  // 该方法在 renderer 侧已无任何调用者（grep packages/ui packages/desktop 为零）。
}

export const IHboxSessionService = createServiceDescriptor<IHboxSessionService>(
  ServiceChannels.HboxSession,
);
