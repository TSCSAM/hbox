import type { GenUiTweakMessage, GenUiTweakResult } from "@hbox/shared/gen-ui";

/** 类型边界由 Gen UI 消息 schema 校验；函数体保留上游 JavaScript。 */
export function installGenUiTweakRuntime(
  callTool: (
    name: "__hbox_visualization_annotations__",
    message: GenUiTweakMessage,
  ) => Promise<GenUiTweakResult>,
): void;
