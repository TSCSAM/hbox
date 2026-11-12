import type { IDisposable } from "@hbox/rpc";
import type { IHboxAgentService } from "@hbox/services";
import type { ProcessResourceRuntimeSurface } from "@hbox/shared";
import { HostResponseTypes } from "@hbox/shared";

interface RegisterHostMcpTelemetryOptions {
  agentService: Pick<IHboxAgentService, "onDynamicMcpTelemetry">;
  postMessage(message: unknown): void;
  runtimeSurface: ProcessResourceRuntimeSurface;
}

export function registerHostMcpTelemetry(options: RegisterHostMcpTelemetryOptions): IDisposable {
  return options.agentService.onDynamicMcpTelemetry()((event) => {
    try {
      options.postMessage({
        type: HostResponseTypes.McpTelemetry,
        runtimeSurface: options.runtimeSurface,
        event,
      });
    } catch {
      // main 已退出或 IPC 不可用时只丢当前遥测，不影响 MCP 生命周期。
    }
  });
}
