/**
 * Renderer 端日志工具
 * 通过 IPC 将日志传到 main 进程统一写入 ~/.hbox/v2/logs/YYYY-MM-DD.log
 * 同时保留 console 输出方便开发调试
 */
import { formatLogPrefix } from "@hbox/shared";
import { isRendererProductionBuild } from "./rendererLoggingEnv.js";

export const logger = {
  info(...args: unknown[]) {
    if (isRendererProductionBuild()) return;
    console.log(formatLogPrefix("renderer"), ...args);
    window.hbox?.log("info", args);
  },
  warn(...args: unknown[]) {
    if (isRendererProductionBuild()) return;
    console.warn(formatLogPrefix("renderer"), ...args);
    window.hbox?.log("warn", args);
  },
  error(...args: unknown[]) {
    if (isRendererProductionBuild()) return;
    console.error(formatLogPrefix("renderer"), ...args);
    window.hbox?.log("error", args);
  },
};
