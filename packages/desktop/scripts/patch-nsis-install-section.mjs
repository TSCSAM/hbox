import { readFile, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";

const PATCH_MARKER = "; hbox-installer-details-v1";

function optionalMacro(name) {
  return [`!ifmacrodef ${name}`, `  !insertmacro ${name}`, "!endif"].join("\n");
}

function replaceRequired(source, needle, replacement, label) {
  const index = source.indexOf(needle);
  if (index === -1) {
    throw new Error(`electron-builder installSection.nsh 缺少预期锚点：${label}`);
  }
  return `${source.slice(0, index)}${replacement}${source.slice(index + needle.length)}`;
}

/**
 * 给 electron-builder 的安装段补上可见阶段، و开启 NSIS 内置逐文件详情。
 */
export function patchNsisInstallSectionSource(source) {
  const sourceEol = source.includes("\r\n") ? "\r\n" : "\n";
  let patched = source.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  // 开源发布清理：分叉遗留的旧标记兼容判断随品牌更名一并移除，仓库内已不再存在带该标记的产物。
  if (patched.includes(PATCH_MARKER)) {
    return source;
  }

  const initAnchor = "InitPluginsDir";
  if (patched.includes(initAnchor)) {
    patched = replaceRequired(
      patched,
      initAnchor,
      [
        initAnchor,
        PATCH_MARKER,
        "# 详情区需要同时显示 electron-builder 的 File 条目和项目阶段。",
        "${IfNot} ${Silent}",
        "  SetDetailsPrint listonly",
        "${endif}",
        optionalMacro("customInstallSectionStarted"),
      ].join("\n"),
      "InitPluginsDir",
    );
  } else {
    const detailsAnchor1 = "${IfNot} ${Silent}\n  SetDetailsPrint none\n${endif}";
    const detailsAnchor2 = "${IfNot} ${Silent}\n  SetDetailsPrint listonly\n${endif}";
    const detailsAnchor = patched.includes(detailsAnchor2) ? detailsAnchor2 : detailsAnchor1;
    patched = replaceRequired(
      patched,
      detailsAnchor,
      [
        PATCH_MARKER,
        "# 详情区需要同时显示 electron-builder 的 File 条目和项目阶段。",
        "${IfNot} ${Silent}",
        "  SetDetailsPrint listonly",
        "${endif}",
        optionalMacro("customInstallSectionStarted"),
      ].join("\n"),
      "SetDetailsPrint none/listonly",
    );
  }

  const cleanupStartAnchor =
    "!insertmacro uninstallOldVersion SHELL_CONTEXT\n!insertmacro handleUninstallResult SHELL_CONTEXT";
  patched = replaceRequired(
    patched,
    cleanupStartAnchor,
    `${optionalMacro("customInstallCleanupStarted")}\n${cleanupStartAnchor}`,
    "SHELL_CONTEXT cleanup",
  );

  const cleanupEndAnchor =
    '${if} $installMode == "all"\n  !insertmacro uninstallOldVersion HKEY_CURRENT_USER\n  !insertmacro handleUninstallResult HKEY_CURRENT_USER\n${endIf}';
  patched = replaceRequired(
    patched,
    cleanupEndAnchor,
    `${cleanupEndAnchor}\n${optionalMacro("customInstallCleanupCompleted")}`,
    "HKEY_CURRENT_USER cleanup",
  );

  const extractAnchor = "!insertmacro installApplicationFiles";
  patched = replaceRequired(
    patched,
    extractAnchor,
    `${optionalMacro("customInstallExtractStarted")}\n${extractAnchor}\n${optionalMacro("customInstallExtractCompleted")}`,
    "application extraction",
  );

  const shortcutsAnchor =
    "!insertmacro addStartMenuLink $keepShortcuts\n!insertmacro addDesktopLink $keepShortcuts";
  patched = replaceRequired(
    patched,
    shortcutsAnchor,
    `${optionalMacro("customInstallShortcutsStarted")}\n${shortcutsAnchor}\n${optionalMacro("customInstallShortcutsCompleted")}`,
    "shortcut installation",
  );

  return sourceEol === "\r\n" ? patched.replaceAll("\n", "\r\n") : patched;
}

export async function patchNsisInstallSectionFile(filePath) {
  const source = await readFile(filePath, "utf8");
  const patched = patchNsisInstallSectionSource(source);
  if (patched === source) {
    return { changed: false, originalSource: null };
  }

  await writeFile(filePath, patched, "utf8");
  return { changed: true, originalSource: source };
}

export function restoreNsisInstallSectionFileSync({ filePath, originalSource }) {
  if (originalSource !== null) {
    writeFileSync(filePath, originalSource, "utf8");
  }
}
