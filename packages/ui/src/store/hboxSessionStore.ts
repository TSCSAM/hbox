/**
 * Hbox session UI 状态 store
 *
 * 一个 tab 对应一个 workspace，所以聊天相关状态也必须按 workspace 分桶保存。
 * 这样切换标签页时，当前任务、输入中的草稿态和初始化状态才不会互相串台。
 */
import { create } from "zustand";
import { shouldExposeE2EStoreBridge } from "@/lib/e2eStoreBridge.js";
import { type HboxSessionStoreState } from "./hboxSessionStoreTypes.js";
import { getWorkspaceState } from "./hboxSessionStoreSelectors.js";
import { createNavigationSlice } from "./hboxSessionStoreNavigation.js";
import { createTaskSlice } from "./hboxSessionStoreTaskSlice.js";
import { createWorkspaceSlice } from "./hboxSessionStoreWorkspaceSlice.js";
import { uiMemoryDiagnosticsRegistry } from "@/lib/memoryDiagnostics.js";

export const useHboxSessionStore = create<HboxSessionStoreState>()((set, get) => ({
  workspaces: {},
  ...createNavigationSlice(set, get),
  ...createWorkspaceSlice(set),
  ...createTaskSlice(set),
  getWorkspaceState: (workspacePath: string, workspaceIdentity?: string) =>
    getWorkspaceState(get(), workspacePath, workspaceIdentity),
}));

type HboxSessionStoreE2EBridge = typeof useHboxSessionStore;

declare global {
  interface Window {
    __hboxSessionStoreE2E?: HboxSessionStoreE2EBridge;
  }
}

if (shouldExposeE2EStoreBridge()) {
  // E2E 诊断入口必须由 WDIO 显式打开，不能复用 HBOX_ENV=test，避免产品测试环境暴露可变全局 store。
  window.__hboxSessionStoreE2E = useHboxSessionStore;
}

// ────────────────────────────────────────────
// Re-exports: 保持外部 `from '@/store/hboxSessionStore'` 的导入路径继续工作
// ────────────────────────────────────────────
export * from "./hboxSessionStoreTypes.js";
export * from "./hboxSessionStoreSelectors.js";
// Re-export navigation types used externally:
export type {
  TaskNavigationHistory,
  TaskNavEntry,
  WorkspaceNavEntry,
} from "@/lib/taskNavigationHistory.js";

// 内存诊断计数器：workspace 桶全仓无删除路径，先落日志。
uiMemoryDiagnosticsRegistry.register("sessionStore", () => ({
  workspaces: Object.keys(useHboxSessionStore.getState().workspaces).length,
}));
