import type { TuiReadClipboardImage, TuiWriteClipboardText } from "@hbox/tui";
import type { UiLocale } from "@hbox/i18n";
import type { Logger } from "@hbox/contracts";
import type {
  createManagedCdpBrowserRuntime,
  ManagedCdpBrowserRuntimeOptions,
} from "@hbox/adapters/browser";
import type {
  createDefaultProviderEndpointRoutingPort,
  createModelAdapter,
  createHboxApp,
  CreateDefaultProviderEndpointRoutingPortOptions,
  CreateModelAdapterOptions,
  configureCodingPlanApiKey,
  ConfigureCodingPlanApiKeyOptions,
  inspectHboxSkill,
  inspectWorkspaceHookTrust,
  grantWorkspaceHookTrust,
  revokeWorkspaceHookTrustCli,
  inspectHboxCustomCommand,
  InspectHboxCustomCommandOptions,
  InspectHboxSkillOptions,
  loginHboxCli,
  loginBigmodelCodingPlan,
  LoginBigmodelCodingPlanOptions,
  LoginHboxCliOptions,
  listHboxCustomCommands,
  ListHboxCustomCommandsOptions,
  loadHboxCustomCommand,
  listHboxSessions,
  listHboxSkills,
  ListHboxSessionsOptions,
  ListHboxSkillsOptions,
  logoutHboxCli,
  LogoutHboxCliOptions,
  resolveLatestSession,
  ResolveLatestSessionOptions,
  RunHboxProtocolAgentOptions,
  prepareHboxTelemetryEnv,
  startProcessProviderRegistryRuntime,
  shutdownHboxTelemetry,
  HboxAppOptions,
} from "@hbox/bootstrap";
import type { CliEnv, DotenvLoadResult, LoadCliDotenvOptions } from "./env.js";
import type { PluginsCommandOverrides } from "./plugins-command.js";
import type { CliShutdownProcess } from "./shutdown.js";
import type { resolveWorkspaceGitBranch } from "./tui-workspace-git.js";

export type BootstrapModule = typeof import("@hbox/bootstrap");

export interface RunDependencies extends PluginsCommandOverrides {
  migrateStorage?: () => Promise<import("@hbox/shared/sqlite-migrations").MigrationResult>;
  protocolLifecycle?: RunHboxProtocolAgentOptions["lifecycle"];
  protocolInput?: NodeJS.ReadableStream;
  createManagedCdpBrowserRuntime?: (
    options?: ManagedCdpBrowserRuntimeOptions,
  ) => ReturnType<typeof createManagedCdpBrowserRuntime>;
  createModelAdapter?: (
    options?: CreateModelAdapterOptions,
  ) => ReturnType<typeof createModelAdapter>;
  createProviderEndpointRoutingPort?: (
    options: CreateDefaultProviderEndpointRoutingPortOptions,
  ) => ReturnType<typeof createDefaultProviderEndpointRoutingPort>;
  createHboxApp?: (
    options?: HboxAppOptions,
  ) => Awaited<ReturnType<typeof createHboxApp>> | ReturnType<typeof createHboxApp>;
  /**
   * Session-event shaper for --output-format stream-json. Defaults to the
   * bootstrap module's, which is also what the protocol server uses; injectable
   * so a caller that supplies its own `createHboxApp` (tests, embedders) can
   * still stream, since the bootstrap module is not loaded on that path.
   */
  mapSessionEvent?: BootstrapModule["mapSessionEvent"];
  cwd?: () => string;
  env?: CliEnv;
  inspectSkill?: (options: InspectHboxSkillOptions) => ReturnType<typeof inspectHboxSkill>;
  inspectWorkspaceHookTrust?: typeof inspectWorkspaceHookTrust;
  grantWorkspaceHookTrust?: typeof grantWorkspaceHookTrust;
  revokeWorkspaceHookTrustCli?: typeof revokeWorkspaceHookTrustCli;
  inspectCustomCommand?: (
    options: InspectHboxCustomCommandOptions,
  ) => ReturnType<typeof inspectHboxCustomCommand>;
  loginHboxCli?: (options?: LoginHboxCliOptions) => ReturnType<typeof loginHboxCli>;
  loginBigmodelCodingPlan?: (
    options?: LoginBigmodelCodingPlanOptions,
  ) => ReturnType<typeof loginBigmodelCodingPlan>;
  configureCodingPlanApiKey?: (
    options: ConfigureCodingPlanApiKeyOptions,
  ) => ReturnType<typeof configureCodingPlanApiKey>;
  loadDotenv?: (options?: LoadCliDotenvOptions) => DotenvLoadResult;
  prepareHboxTelemetryEnv?: typeof prepareHboxTelemetryEnv;
  projectConfigPath?: string;
  listSessions?: (options: ListHboxSessionsOptions) => ReturnType<typeof listHboxSessions>;
  listCustomCommands?: (
    options: ListHboxCustomCommandsOptions,
  ) => ReturnType<typeof listHboxCustomCommands>;
  loadCustomCommand?: (
    options: InspectHboxCustomCommandOptions,
  ) => ReturnType<typeof loadHboxCustomCommand>;
  // headless slash 路由要和 app facade 的保留名 gate 用同一个判据；默认取 bootstrap 的，
  // 注入点只为让单测不必拉起整个 bootstrap 模块。见 prompt-command.ts。
  isReservedSlashCommandName?: BootstrapModule["isReservedHboxSlashCommandName"];
  listSkills?: (options: ListHboxSkillsOptions) => ReturnType<typeof listHboxSkills>;
  logger?: Logger;
  readClipboardImage?: TuiReadClipboardImage;
  writeClipboardText?: TuiWriteClipboardText;
  resolveLatestSession?: (
    options: ResolveLatestSessionOptions,
  ) => ReturnType<typeof resolveLatestSession>;
  resolveWorkspaceGitBranch?: typeof resolveWorkspaceGitBranch;
  logoutHboxCli?: (options?: LogoutHboxCliOptions) => ReturnType<typeof logoutHboxCli>;
  runHboxProtocolAgent?: (options?: RunHboxProtocolAgentOptions) => Promise<void>;
  runTui?: typeof import("@hbox/tui").runTui;
  skipUserConfig?: boolean;
  userConfigPath?: string;
  exitProcess?: (code: number) => void;
  shutdownCleanupTimeoutMs?: number;
  shutdownProcess?: CliShutdownProcess;
  startProcessProviderRegistryRuntime?: typeof startProcessProviderRegistryRuntime;
  shutdownHboxTelemetry?: typeof shutdownHboxTelemetry;
}

export type CliPermissionMode = "build" | "plan" | "edit" | "yolo" | "guarded";
export type CliRuntimeMode = CliPermissionMode | "auto";

export interface CliModeState {
  current?: CliRuntimeMode;
  override?: CliPermissionMode;
}

export interface CliTargetRequest {
  objective: string;
  replaceExisting: boolean;
}

export type ModeCapableApp = Awaited<ReturnType<typeof createHboxApp>> & {
  getMode?: () => CliRuntimeMode;
  setLocale?: (locale: UiLocale) => Promise<{ locale: "en-US" | "zh-CN" }>;
  setMode?: (mode: CliRuntimeMode) => Promise<{ mode: CliRuntimeMode }>;
};

export interface CliResumeRequest {
  continueSession: boolean;
  resumeSessionId?: string;
}
