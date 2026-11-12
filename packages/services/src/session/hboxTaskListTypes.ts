import type { WorkspacePurpose, HboxTaskMeta } from "@hbox/shared";

export type HboxTaskListKind = "pinned" | "archived" | "timeline" | "active";
export type HboxTaskListSortBy = "created" | "updated";

export interface HboxTaskListWorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  workspacePurpose?: WorkspacePurpose;
}

export interface HboxTaskListQuery {
  kind: HboxTaskListKind | "all";
  /** host 由存储 owner 确定全部范围，不接受 UI 已打开工作区作为历史目录。 */
  workspaceScopes: HboxTaskListWorkspaceScope[] | "host";
  sortBy: HboxTaskListSortBy;
  search?: string;
  limit?: number;
}

export type HboxTaskListItem = HboxTaskMeta & {
  searchSnippet?: string;
  searchSnippets?: string[];
};

export interface HboxTaskListResult {
  items: HboxTaskListItem[];
  total: number;
  hasMore: boolean;
}

export interface HboxWorkspaceEventSubscriptionParams {
  workspacePath: string;
  workspaceIdentity?: string;
}
