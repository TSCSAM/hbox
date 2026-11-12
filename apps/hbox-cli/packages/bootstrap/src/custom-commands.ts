import { resolve } from "node:path";
import { createConfig } from "@hbox/adapters/config";
import { createNodeCustomCommandAdapter } from "@hbox/adapters/commands";
import type {
  CustomCommandContent,
  CustomCommandDiagnostic,
  CustomCommandLoadOutcome,
  Logger,
} from "@hbox/contracts";
import { resolveHboxPlugins } from "./plugins.js";
import { collectDisabledPaths } from "./skill-command-overrides.js";

export interface ListHboxCustomCommandsOptions {
  env?: NodeJS.ProcessEnv;
  homeDirectory?: string;
  logger?: Logger;
  projectConfigPath?: string;
  skipUserConfig?: boolean;
  userConfigPath?: string;
  workingDirectory?: string;
  additionalDirectories?: readonly string[];
}

export interface InspectHboxCustomCommandOptions extends ListHboxCustomCommandsOptions {
  name: string;
}

export interface HboxCustomCommandInspection {
  command: CustomCommandContent;
  diagnostics: CustomCommandDiagnostic[];
}

export async function listHboxCustomCommands(
  options: ListHboxCustomCommandsOptions = {},
): Promise<CustomCommandLoadOutcome> {
  const discovery = createCustomCommandDiscovery(options);
  return await discovery.adapter.discoverCommands({
    workingDirectory: discovery.workingDirectory,
  });
}

export async function inspectHboxCustomCommand(
  options: InspectHboxCustomCommandOptions,
): Promise<HboxCustomCommandInspection> {
  const discovery = createCustomCommandDiscovery(options);
  const workingDirectory = discovery.workingDirectory;
  const adapter = discovery.adapter;
  const outcome = await adapter.discoverCommands({ workingDirectory });
  const normalizedName = normalizeCommandName(options.name);
  if (!outcome.commands.some((command) => command.name === normalizedName)) {
    throw new Error(`Custom command not found: ${options.name}`);
  }

  return {
    command: await adapter.loadCommand({
      name: normalizedName,
      workingDirectory,
    }),
    diagnostics: outcome.diagnostics,
  };
}

export async function loadHboxCustomCommand(
  options: InspectHboxCustomCommandOptions,
): Promise<CustomCommandContent> {
  const discovery = createCustomCommandDiscovery(options);
  return await discovery.adapter.loadCommand({
    name: normalizeCommandName(options.name),
    workingDirectory: discovery.workingDirectory,
  });
}

function createCustomCommandDiscovery(options: ListHboxCustomCommandsOptions) {
  const workingDirectory = resolve(options.workingDirectory ?? process.cwd());
  const configResult = createConfig({
    env: options.env,
    projectConfigPath: options.projectConfigPath,
    workingDirectory,
    skipUserConfig: options.skipUserConfig,
    userConfigPath: options.userConfigPath,
  });
  const pluginOutcome = resolveHboxPlugins({
    configResult,
    env: options.env,
    logger: options.logger,
    projectConfigPath: options.projectConfigPath,
    skipUserConfig: options.skipUserConfig,
    userConfigPath: options.userConfigPath,
    workingDirectory,
  });
  return {
    adapter: createNodeCustomCommandAdapter({
      extraResolvedRoots: pluginOutcome.commandRoots,
      disabledPaths: collectDisabledPaths(configResult.config.commandOverrides),
      homeDirectory: options.homeDirectory,
      additionalDirectories: options.additionalDirectories,
    }),
    workingDirectory,
  };
}

function normalizeCommandName(name: string): string {
  return name.trim().replace(/^\/+/, "").toLowerCase();
}
