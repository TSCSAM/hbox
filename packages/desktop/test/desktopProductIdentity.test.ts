import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  desktopProductIdentities,
  resolveDesktopArtifactSuffix,
  resolveDesktopProductFlavor,
  resolveWindowsAppUserModelId,
  resolveWindowsAppUserModelIdForFlavor,
  resolveDesktopProductIdentity,
} from "../scripts/desktop-product-identity.mjs";

describe("desktop product identity", () => {
  it("Windows installation identity uses the Hbox folder and uninstaller names", () => {
    const config = readFileSync(resolve(import.meta.dirname, "../electron-builder.config.js"), "utf8");
    const nsis = readFileSync(resolve(import.meta.dirname, "../build/installer.nsh"), "utf8");
    expect(desktopProductIdentities.production.productName).toBe("Hbox");
    expect(config).toContain('shortcutName: "Hbox"');
    expect(config).toContain('uninstallDisplayName: "Hbox"');
    expect(config).toContain('const WINDOWS_INSTALL_MANIFEST_NAME = ".hbox-install-manifest";');
    // NSIS 内部符号使用 HBOX_ 前缀，且值必须与 builder 写入的清单文件名一致。
    expect(nsis).toContain('!define HBOX_INSTALL_MANIFEST_NAME ".hbox-install-manifest"');
    expect(nsis).toContain('$WINDIR\\Logs\\Hbox-installer.log');
    expect(nsis).toContain('$TEMP\\Hbox-uninstaller.log');
    expect(nsis).toContain('DetailPrint "Hbox:');
  });

  // 开源发布清理：根目录的 npm package-lock.json 是上游分叉遗留产物（本项目使用 pnpm，
  // 依赖锁由 pnpm-lock.yaml 管理），已随发布清理移除，故不再校验该文件的版本同步。

  it("HBOX_ENV=test 使用显示名同为 Hbox、appId 独立的 Preview 身份", () => {
    const previewIdentity = resolveDesktopProductIdentity({ HBOX_ENV: "test" });
    expect(previewIdentity).toEqual({
      flavor: "preview",
      appId: "dev.hbox.app.preview",
      productName: "Hbox",
      linuxExecutableName: "hbox-preview",
      linuxPackageName: "hbox-preview",
      cuaHelperInstallVariant: "preview",
    });
    expect(previewIdentity.productName).toBe(desktopProductIdentities.production.productName);
    expect(previewIdentity.appId).not.toBe(desktopProductIdentities.production.appId);
  });

  it("HBOX_PREVIEW_IDENTITY=1 让生产后端的构建改用 Preview 身份", () => {
    // 身份与后端环境分轴：同一份 Preview 身份既可以连测试后端，也可以连生产后端。
    for (const flag of ["1", " 1 "]) {
      const env = { HBOX_ENV: "production", HBOX_PREVIEW_IDENTITY: flag };
      expect(resolveDesktopProductFlavor(env)).toBe("preview");
      expect(resolveDesktopProductIdentity(env)).toBe(desktopProductIdentities.preview);
    }
    for (const flag of ["", "0"]) {
      const env = { HBOX_ENV: "production", HBOX_PREVIEW_IDENTITY: flag };
      expect(resolveDesktopProductFlavor(env)).toBe("production");
    }
  });

  it("开关只认 1/0：其它拼写在构建期直接失败，不能在路由层漏匹配却在脚本层开启", () => {
    // CI workflow 规则与 release 门做 == "1" 精确比较；若脚本层再接受 true/yes/on，
    // `HBOX_PREVIEW_IDENTITY=true` 会落入 @electron/dev 生产验收目录却打出 Preview 身份包。
    for (const flag of ["true", "yes", "on", "false", "no", "off", "2"]) {
      expect(() =>
        resolveDesktopProductFlavor({ HBOX_ENV: "production", HBOX_PREVIEW_IDENTITY: flag }),
      ).toThrow(/expected 1 or 0/);
    }
  });

  it("测试后端永远是 Preview 身份，开关无法把它变成正式 Hbox", () => {
    expect(resolveDesktopProductFlavor({ HBOX_ENV: "test", HBOX_PREVIEW_IDENTITY: "0" })).toBe(
      "preview",
    );
    expect(resolveDesktopProductFlavor({ HBOX_ENV: "test", HBOX_PREVIEW_IDENTITY: "1" })).toBe(
      "preview",
    );
  });

  it("产物后缀只标记后端环境，不随 Preview 身份变化", () => {
    expect(resolveDesktopArtifactSuffix({ HBOX_ENV: "test" })).toBe("_TEST");
    expect(resolveDesktopArtifactSuffix({ HBOX_ENV: "production" })).toBe("");
    expect(
      resolveDesktopArtifactSuffix({ HBOX_ENV: "production", HBOX_PREVIEW_IDENTITY: "1" }),
    ).toBe("");
    expect(resolveDesktopArtifactSuffix({})).toBe("_TEST");
  });

  it("HBOX_ENV=production 完整保留正式包身份", () => {
    expect(resolveDesktopProductIdentity({ HBOX_ENV: "production" })).toBe(
      desktopProductIdentities.production,
    );
    expect(desktopProductIdentities.production).toEqual({
      flavor: "production",
      appId: "dev.hbox.app",
      productName: "Hbox",
      linuxExecutableName: "hbox",
      linuxPackageName: "hbox",
      cuaHelperInstallVariant: null,
    });
  });

  it("未注入或未知环境时不应误生成正式安装身份", () => {
    expect(resolveDesktopProductIdentity({}).flavor).toBe("preview");
    expect(resolveDesktopProductIdentity({ HBOX_ENV: "staging" }).flavor).toBe("preview");
  });

  it("打包态 Windows AUMID 必须和 NSIS appId 保持一致", () => {
    expect(resolveWindowsAppUserModelId({ HBOX_ENV: "production" })).toBe(
      desktopProductIdentities.production.appId,
    );
    expect(resolveWindowsAppUserModelId({ HBOX_ENV: "test" })).toBe(
      desktopProductIdentities.preview.appId,
    );
    expect(
      resolveWindowsAppUserModelId({ HBOX_ENV: "production", HBOX_PREVIEW_IDENTITY: "1" }),
    ).toBe(desktopProductIdentities.preview.appId);
    // 主进程按编译期 flavor 取 AUMID，不依赖安装后机器上的环境变量。
    expect(resolveWindowsAppUserModelIdForFlavor("preview")).toBe(
      desktopProductIdentities.preview.appId,
    );
    expect(resolveWindowsAppUserModelIdForFlavor("production")).toBe(
      desktopProductIdentities.production.appId,
    );
  });

  it("开发态继续使用独立 AUMID，避免污染打包版 Shell 身份", () => {
    expect(resolveWindowsAppUserModelId({}, { isPackaged: false })).toBe("cn.aminer.hbox");
  });
});
