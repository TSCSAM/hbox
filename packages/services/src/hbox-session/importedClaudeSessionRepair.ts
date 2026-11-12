import type { HboxSessionStateSnapshot } from "@hbox/shared";
import { createServiceLogger } from "#src/logger/serviceLogger.js";
import { repairImportedClaudeSessionSnapshot } from "#src/session/claude-native/importedClaudeHistoryRepair.js";
import type { IHboxAgentService } from "#src/hbox-agent/hboxAgent.js";
import type {
  HboxSessionReadParams,
  HboxSessionResumeParams,
} from "#src/hbox-session/hboxSession.js";

const logger = createServiceLogger("hbox-session-service");

export async function repairEmptyImportedClaudeSessionSnapshot(params: {
  agentService: IHboxAgentService;
  snapshot: HboxSessionStateSnapshot;
  target: HboxSessionResumeParams | HboxSessionReadParams;
}): Promise<HboxSessionStateSnapshot> {
  const repaired = await repairImportedClaudeSessionSnapshot({
    snapshot: params.snapshot,
    target: {
      workspacePath: params.target.workspacePath,
      workspaceIdentity: params.target.workspaceIdentity,
      taskId: params.target.sessionId,
      ...("mcpServers" in params.target && params.target.mcpServers
        ? { mcpServers: params.target.mcpServers }
        : {}),
    },
    createSession: (input) => params.agentService.createSession(input),
    onRepair: (history) => {
      logger.warn(
        undefined,
        `[hbox-session-service] Claude 导入 session 历史异常，按 ${history.source} 回填 taskId=${params.target.sessionId}`,
      );
    },
  });
  return repaired ?? params.snapshot;
}
