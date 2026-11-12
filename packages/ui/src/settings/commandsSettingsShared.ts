import {
  HBOX_AGENT_PROVIDER,
  HBOX_COMMAND_AGENT_SOURCES,
  type HboxProvider,
  type CommandAgentSource,
} from "@hbox/shared";

export const COMMAND_AGENT_SOURCES = [
  ...HBOX_COMMAND_AGENT_SOURCES,
] as const satisfies readonly CommandAgentSource[];

export const COMMAND_AGENT_SOURCE_META: Record<
  CommandAgentSource,
  {
    labelId: string;
    provider: HboxProvider;
    pathHint: string;
  }
> = {
  hboxAgent: {
    labelId: "settings.commands.source.hboxAgent",
    pathHint: "~/.hbox/commands",
    provider: HBOX_AGENT_PROVIDER,
  },
};
