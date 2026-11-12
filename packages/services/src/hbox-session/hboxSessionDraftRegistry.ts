import type { HboxSessionStateSnapshot } from "@hbox/shared";
import type {
  HboxSessionWorkspaceTarget,
  HboxTaskTarget,
} from "#src/hbox-session/hboxSession.js";

function getWorkspaceKey(target: HboxSessionWorkspaceTarget): string {
  return target.workspaceIdentity?.trim() || target.workspacePath;
}

function getSessionScopedKey(target: HboxTaskTarget): string {
  return `${getWorkspaceKey(target)}\0${target.sessionId}`;
}

export function createHboxDeferredDraftRegistry() {
  const sessionKeys = new Set<string>();

  return {
    remember(params: HboxSessionWorkspaceTarget, snapshot: HboxSessionStateSnapshot): void {
      sessionKeys.add(
        getSessionScopedKey({
          workspacePath: snapshot.session.workspace.workspacePath,
          workspaceIdentity:
            snapshot.session.workspace.workspaceIdentity ?? params.workspaceIdentity,
          sessionId: snapshot.session.sessionId,
        }),
      );
    },

    has(target: HboxTaskTarget): boolean {
      return sessionKeys.has(getSessionScopedKey(target));
    },

    forget(target: HboxTaskTarget): void {
      sessionKeys.delete(getSessionScopedKey(target));
    },
  };
}
