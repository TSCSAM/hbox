import { recordArmsCustomEventForE2E } from "@hbox/ui";
import {
  DesktopCommandIds,
  buildLocalMediaPreviewUrl,
  unwrapRemoteWorkspaceBindResult,
  type IPlatformService,
} from "@hbox/shared";

import { desktopBrowserPlatformBridge } from "./desktopBrowserPlatformBridge.js";
import { createDesktopPluginSandboxPlatform } from "./plugin-sandbox/desktopPluginSandboxPlatform.js";

export function createDesktopPlatform(options: {
  isLocalDevelopmentRuntime: boolean;
}): IPlatformService {
  return {
    canSelectFilePath: true,
    canOpenLocalFiles: true,
    pluginSandbox: createDesktopPluginSandboxPlatform(),
    createLocalMediaPreviewUrl: buildLocalMediaPreviewUrl,
    isLocalDevelopmentRuntime: options.isLocalDevelopmentRuntime,
    selectDirectory: () => window.hbox.selectDirectory(),
    selectDirectories: () => window.hbox.selectDirectories(),
    selectFile: () => window.hbox.selectFile(),
    selectFiles: () => window.hbox.selectFiles?.() ?? Promise.resolve([]),
    createTempTextAttachment: (payload) => window.hbox.createTempTextAttachment(payload),
    materializeWorkflowArtifactFile: (payload) =>
      window.hbox.materializeWorkflowArtifactFile(payload),
    onRemoteConnectionLog: (handler) => window.hbox.onRemoteConnectionLog(handler),
    onRemoteSessionClosed: (handler) => window.hbox.onRemoteSessionClosed(handler),
    // Source 自动重连会替换 logical session；统一由 preload bridge 转发换代事件。
    onRemoteSessionReconnected: (handler) =>
      window.hbox.onRemoteSessionReconnected?.(handler) ?? (() => {}),
    activateOrSetWorkspace: (path) =>
      window.hbox.activateOrSetWorkspace?.(path) ?? Promise.resolve({ activated: false }),
    connectRemote: (remoteOptions, requestId, context) =>
      window.hbox.connectRemote(remoteOptions, requestId, context),
    requestSourceSettingsAttachment: (sourceServerId) =>
      window.hbox.requestSourceSettingsAttachment?.(sourceServerId) ??
      Promise.reject(new Error("Source settings attachment bridge unavailable")),
    cancelPendingRemoteConnection: (requestId) =>
      window.hbox.cancelPendingRemoteConnection?.(requestId) ?? Promise.resolve(),
    bindRemoteWorkspaceSessionContext: async (context) => {
      if (!window.hbox.bindRemoteWorkspaceSessionContext) {
        throw new Error("Desktop bindRemoteWorkspaceSessionContext bridge unavailable");
      }
      // preload 返回结构化结果，在页面一侧还原错误才能保留 code/retryable。
      return unwrapRemoteWorkspaceBindResult(
        await window.hbox.bindRemoteWorkspaceSessionContext(context),
      );
    },
    startWebRemoteControl: (context) => window.hbox.startWebRemoteControl(context),
    stopWebRemoteControl: () => window.hbox.stopWebRemoteControl(),
    getWebRemoteControlStatus: () => window.hbox.getWebRemoteControlStatus(),
    onWebRemoteControlStatusChanged: (handler) =>
      window.hbox.onWebRemoteControlStatusChanged?.(handler) ?? (() => {}),
    disposeRemoteSession: (sessionId) => window.hbox.disposeRemoteSession(sessionId),
    isDockerAvailable: () => window.hbox.isDockerAvailable(),
    listWSLDistros: () => window.hbox.listWSLDistros(),
    listDockerContainers: () => window.hbox.listDockerContainers(),
    listSSHConfigAliases: () => window.hbox.listSSHConfigAliases(),
    loadMcpFromUserDirectory: (payload) => window.hbox.loadMcpFromUserDirectory(payload),
    saveMcpToUserDirectory: (payload) => window.hbox.saveMcpToUserDirectory(payload),
    migrateLegacyCommonMcp: (payload) => window.hbox.migrateLegacyCommonMcp(payload),
    openExternal: (url) => window.hbox.openExternal(url),
    openFeedback: () => window.hbox.executeDesktopCommand(DesktopCommandIds.OpenFeedback),
    openCommunity: () => window.hbox.executeDesktopCommand(DesktopCommandIds.OpenCommunity),
    canOpenCommunity: (locale) => window.hbox.canOpenCommunity(locale),
    openInFileManager: (path) => window.hbox.openInFileManager(path),
    openExternalFile: (path) => window.hbox.openExternalFile(path),
    openCuaPermissionOnboarding: window.hbox.openCuaPermissionOnboarding
      ? (permissionOptions) =>
          window.hbox.openCuaPermissionOnboarding?.(permissionOptions) ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    prepareCuaHelperPermissionDrag: window.hbox.prepareCuaHelperPermissionDrag
      ? () =>
          window.hbox.prepareCuaHelperPermissionDrag?.() ??
          Promise.resolve({ success: false, error: "not_supported" })
      : undefined,
    startCuaHelperPermissionDrag: window.hbox.startCuaHelperPermissionDrag
      ? () => window.hbox.startCuaHelperPermissionDrag?.()
      : undefined,
    notifyWebRemoteControlAuthStateChanged: (change) =>
      window.hbox.notifyWebRemoteControlAuthStateChanged(change),
    registerOAuthState: (payload) => window.hbox.registerOAuthState(payload),
    onOAuthCallback: (callback) => window.hbox.onOAuthCallback(callback),
    onPaymentCallback: (callback) => window.hbox.onPaymentCallback(callback),
    onShareImport: (callback) => window.hbox.onShareImport?.(callback) ?? (() => {}),
    notifyRendererReady: () => window.hbox.notifyRendererReady(),
    syncTelemetryContext: (context) => window.hbox.syncTelemetryContext(context),
    reportTelemetryEvent: (payload) => window.hbox.reportTelemetryEvent(payload),
    reportArmsCustomEvent: (payload) => {
      recordArmsCustomEventForE2E(payload);
      return window.hbox.reportArmsCustomEvent(payload);
    },
    getRendererActionTraceConfig: window.hbox.getRendererActionTraceConfig
      ? () => window.hbox.getRendererActionTraceConfig!()
      : undefined,
    onRendererActionTraceConfigChanged: window.hbox.onRendererActionTraceConfigChanged
      ? (callback) => window.hbox.onRendererActionTraceConfigChanged!(callback)
      : undefined,
    reportLocalTtftBatch: (batch) => window.hbox.reportLocalTtftBatch(batch),
    reportRendererActionTraceBatch: window.hbox.reportRendererActionTraceBatch
      ? (batch) => window.hbox.reportRendererActionTraceBatch!(batch)
      : undefined,
    reportRendererHeapSample: window.hbox.reportRendererHeapSample
      ? (sample) => window.hbox.reportRendererHeapSample!(sample)
      : undefined,
    showTaskNotification: (payload) => window.hbox.showTaskNotification(payload),
    syncWindowTabs: (paths) => window.hbox.syncWindowTabs(paths),
    syncWebRemoteControlWorkspaces: (workspaces) =>
      window.hbox.syncWebRemoteControlWorkspaces?.(workspaces),
    onWebRemoteControlReconnectWorkspace: (handler) =>
      window.hbox.onWebRemoteControlReconnectWorkspace?.(handler) ?? (() => {}),
    onWebRemoteControlRendererAction: (handler) =>
      window.hbox.onWebRemoteControlRendererAction?.(handler) ?? (() => {}),
    syncWindowUnreadCount: (count) => window.hbox.syncWindowUnreadCount(count),
    syncActiveTaskSession: (sessionId) => window.hbox.syncActiveTaskSession(sessionId),
    syncAppSettings: (patch) => window.hbox.syncAppSettings?.(patch),
    // 桥缺失（旧 preload 升级窗口）时按 supported 兜底，与 Windows 现状一致，设置开关可用。
    getCloseToTrayCapability: () =>
      window.hbox.getCloseToTrayCapability?.() ??
      Promise.resolve({ supported: true, gnomeLikeWithoutTray: false }),
    setShortcutRecordingActive: (active) => window.hbox.setShortcutRecordingActive?.(active),
    onFocusTab: (handler) => window.hbox.onFocusTab(handler),
    onNewTab: (handler) => window.hbox.onNewTab(handler),
    onCloseActiveContextRequest: (handler) =>
      window.hbox.onCloseActiveContextRequest?.(handler) ?? (() => {}),
    onOpenBrowserUrl: (handler) => window.hbox.onOpenBrowserUrl?.(handler) ?? (() => {}),
    onEmbeddedBrowserPermissionPrompt: (handler) =>
      window.hbox.onEmbeddedBrowserPermissionPrompt?.(handler) ?? (() => {}),
    resolveEmbeddedBrowserPermissionPrompt: (request) =>
      window.hbox.resolveEmbeddedBrowserPermissionPrompt?.(request),
    getEmbeddedBrowserSitePermissions: () =>
      window.hbox.getEmbeddedBrowserSitePermissions?.() ?? Promise.resolve({}),
    setEmbeddedBrowserSitePermission: (request) =>
      window.hbox.setEmbeddedBrowserSitePermission?.(request) ?? Promise.resolve({}),
    clearEmbeddedBrowserSitePermissions: () =>
      window.hbox.clearEmbeddedBrowserSitePermissions?.() ?? Promise.resolve({}),
    resetEmbeddedBrowserSitePermission: (request) =>
      window.hbox.resetEmbeddedBrowserSitePermission?.(request) ?? Promise.resolve({}),
    onBrowserViewScreenshotSurfacePrepare: (handler) =>
      window.hbox.onBrowserViewScreenshotSurfacePrepare?.(handler) ?? (() => {}),
    onBrowserViewScreenshotSurfaceRelease: (handler) =>
      window.hbox.onBrowserViewScreenshotSurfaceRelease?.(handler) ?? (() => {}),
    browserViewScreenshotSurfaceReady: (payload) =>
      window.hbox.browserViewScreenshotSurfaceReady?.(payload),
    ...desktopBrowserPlatformBridge,
    onNewTask: (handler) => window.hbox.onNewTask(handler),
    onOpenWorkspace: (handler) => {
      // 开发态或升级后的旧窗口可能仍运行未暴露 onOpenWorkspace 的 preload，
      // renderer 直接调用会在启动时崩溃。这里和 activateOrSetWorkspace 一样做兼容兜底，
      // 缺少该 bridge 时只禁用原生菜单回调，不影响应用继续打开。
      return window.hbox.onOpenWorkspace?.(handler) ?? (() => {});
    },
    onOpenWorkspacePath: (handler) => window.hbox.onOpenWorkspacePath?.(handler) ?? (() => {}),
    onOpenFeedbackDialog: (handler) => window.hbox.onOpenFeedbackDialog?.(handler) ?? (() => {}),
    onOpenTicketsPanel: (handler) => window.hbox.onOpenTicketsPanel?.(handler) ?? (() => {}),
    onWindowFullscreenChanged: (handler) => window.hbox.onWindowFullscreenChanged(handler),
    getDesktopWindowChromeState: window.hbox.getDesktopWindowChromeState
      ? () => window.hbox.getDesktopWindowChromeState!()
      : undefined,
    onDesktopWindowChromeStateChanged: window.hbox.onDesktopWindowChromeStateChanged
      ? (handler) => window.hbox.onDesktopWindowChromeStateChanged!(handler)
      : undefined,
    getWindowControlsOverlayMetrics: () => window.hbox.getWindowControlsOverlayMetrics?.() ?? null,
    onWindowControlsOverlayChanged: (handler) =>
      window.hbox.onWindowControlsOverlayChanged?.(handler) ?? (() => {}),
    getDesktopZoomLevel: () =>
      window.hbox.getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
    onDesktopZoomLevelChanged: (handler) =>
      window.hbox.onDesktopZoomLevelChanged?.(handler) ?? (() => {}),
    onTaskNotificationClick: (handler) => window.hbox.onTaskNotificationClick(handler),
    exportLogs: () => window.hbox.exportLogs(),
    captureWindowScreenshot: () =>
      window.hbox.captureWindowScreenshot?.() ?? Promise.resolve(null),
    onUpdateReady: (callback) => window.hbox.onUpdateReady(callback),
    onUpdateCheckResult: (callback) => window.hbox.onUpdateCheckResult(callback),
    onUpdateStateChanged: (callback) => window.hbox.onUpdateStateChanged?.(callback) ?? (() => {}),
    getUpdateState: () =>
      window.hbox.getUpdateState?.() ?? Promise.resolve({ kind: "idle", enabled: true }),
    downloadUpdate: () => window.hbox.downloadUpdate?.() ?? Promise.resolve(),
    cancelUpdateDownload: () => window.hbox.cancelUpdateDownload?.() ?? Promise.resolve(),
    openUpdateStatusWindow: () => window.hbox.openUpdateStatusWindow?.() ?? Promise.resolve(),
    getAutoUpdatePreferences: () =>
      window.hbox.getAutoUpdatePreferences?.() ??
      Promise.resolve({ autoDownloadAndInstallUpdates: false }),
    setAutoDownloadAndInstallUpdates: (enabled) =>
      window.hbox.setAutoDownloadAndInstallUpdates?.(enabled) ?? Promise.resolve(),
    getDesktopSessionActivity: () =>
      window.hbox.getDesktopSessionActivity?.() ??
      Promise.resolve({ runningAgentSessionCount: 0 }),
    getHboxStdioTapDevState: () =>
      window.hbox.getHboxStdioTapDevState?.() ??
      Promise.resolve({ enabled: false, visible: false, logDir: "", statePath: "" }),
    onSettingsChanged: (callback) => window.hbox.onSettingsChanged?.(callback) ?? (() => {}),
    onApplicationLocaleChanged: (callback) =>
      window.hbox.onApplicationLocaleChanged?.(callback) ?? (() => {}),
    onPostUpdateReleaseNotes: (callback) => window.hbox.onPostUpdateReleaseNotes(callback),
    acknowledgePostUpdateReleaseNotes: (version) =>
      window.hbox.acknowledgePostUpdateReleaseNotes(version),
    skipUpdateVersion: (version) => window.hbox.skipUpdateVersion?.(version) ?? Promise.resolve(),
    quitAndInstallUpdate: () => window.hbox.quitAndInstallUpdate(),
    getInstalledEditors: (filePath) => window.hbox.getInstalledEditors(filePath),
    getFileApplications: (target) => window.hbox.getFileApplications(target),
    openFileWithApplication: (applicationId, target) =>
      window.hbox.openFileWithApplication(applicationId, target),
    getApplicationIcon: (bundleId) =>
      window.hbox.getApplicationIcon?.(bundleId) ?? Promise.resolve(null),
    openInEditor: (editorId, path, editorOptions) =>
      window.hbox.openInEditor(editorId, path, editorOptions),
    executeDesktopCommand: (command) => window.hbox.executeDesktopCommand(command),
    setApplicationLocale: (locale) => window.hbox.setApplicationLocale(locale),
    getSystemLocale: () =>
      window.hbox.getSystemLocale?.() ??
      Promise.resolve(navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"),
    setTitleBarTheme: (theme) => window.hbox.setTitleBarTheme(theme),
    getDeviceId: () =>
      (window as Window & { __HBOX_DEVICE_ID__?: string }).__HBOX_DEVICE_ID__ ?? "",
  };
}
