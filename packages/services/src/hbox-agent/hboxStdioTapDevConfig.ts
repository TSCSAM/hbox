import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HboxStdioTapDevState } from "@hbox/shared";
import { getAppConfigDir } from "#src/paths.js";
import { isEffectiveDevelopmentNodeEnv } from "#src/runtime-tools/nodeEnv.js";

interface HboxStdioTapStateFile {
  enabled?: boolean;
}

export function isHboxStdioTapDevVisible(): boolean {
  return isEffectiveDevelopmentNodeEnv();
}

export function getHboxStdioTapDevDir(): string {
  return join(getAppConfigDir(), "dev");
}

export function getHboxStdioTapDevLogDir(): string {
  return join(getHboxStdioTapDevDir(), "stdio-traffic");
}

export function getHboxStdioTapDevStatePath(): string {
  return join(getHboxStdioTapDevDir(), "hbox-stdio-tap.json");
}

function readStateFile(path: string): HboxStdioTapStateFile {
  if (!existsSync(path)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as HboxStdioTapStateFile) : {};
  } catch {
    return {};
  }
}

export function readHboxStdioTapDevState(): HboxStdioTapDevState {
  const visible = isHboxStdioTapDevVisible();
  const statePath = getHboxStdioTapDevStatePath();
  const fileState = readStateFile(statePath);
  return {
    enabled: visible && fileState.enabled === true,
    visible,
    logDir: getHboxStdioTapDevLogDir(),
    statePath,
  };
}

export function setHboxStdioTapDevEnabled(enabled: boolean): HboxStdioTapDevState {
  const visible = isHboxStdioTapDevVisible();
  const statePath = getHboxStdioTapDevStatePath();
  mkdirSync(getHboxStdioTapDevDir(), { recursive: true });
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        // 开发态 stdio 抓包是高频原始协议帧，只能通过显式开关写旁路文件，避免误进生产日志。
        enabled: visible && enabled,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  return readHboxStdioTapDevState();
}
