import { describe, expect, it, vi } from "vitest";
import { hboxWorkspaceUpdateModelIoPreferencesResultSchema } from "@hbox/shared";
import { updateModelIoPreferences } from "../src/hbox-protocol/model-io-preferences.js";
import type { HboxProtocolAgentServerContext } from "../src/hbox-protocol/server-types.js";
import { createFakeApp } from "./helpers/fake-hbox-app.js";

const workspace = {
  workspacePath: "/workspace/app",
  workspaceKey: "/workspace/app",
};

describe("ModelIO runtime preferences", () => {
  it("applies full retention to resident apps and caches it for future apps", async () => {
    const setModelIoFullRetentionEnabled = vi.fn();
    const context = {
      appRuntimePreferences: {
        askUserQuestionAutoResolutionEnabled: true,
        modelIoFullRetentionEnabled: false,
        offPeakToolEnabled: false,
      },
      sessions: new Map([
        [
          "sess_model_io",
          {
            app: createFakeApp(undefined, { setModelIoFullRetentionEnabled }),
          },
        ],
      ]),
    } as unknown as HboxProtocolAgentServerContext;

    const result = hboxWorkspaceUpdateModelIoPreferencesResultSchema.parse(
      await updateModelIoPreferences(context, {
        workspace,
        preferences: { fullRetentionEnabled: true },
      }),
    );

    expect(result).toEqual({
      workspace,
      fullRetentionEnabled: true,
      updatedSessionCount: 1,
    });
    expect(context.appRuntimePreferences.modelIoFullRetentionEnabled).toBe(true);
    expect(setModelIoFullRetentionEnabled).toHaveBeenCalledWith(true);
  });
});
