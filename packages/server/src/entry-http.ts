import {
  createServerHostServices,
  createTopicResourcePeers,
  getAppConfigDir,
} from "@hbox/services/node";
import {
  materializeBundledHboxBuiltinProviderConfig,
  readBundledHboxBuiltinProviderConfig,
} from "./bundledHboxBuiltinProviderConfig.js";
import { createHttpServer, resolveHttpServerId } from "./http.js";

async function main(): Promise<void> {
  const hboxBuiltinProviderConfigFilePath = await materializeBundledHboxBuiltinProviderConfig({
    environmentConfigRoot: getAppConfigDir(),
    content: readBundledHboxBuiltinProviderConfig(),
  });
  const port = Number(process.env["PORT"]) || 3030;
  const host = process.env["HBOX_SERVER_HOST"]?.trim() || process.env["HOST"]?.trim() || undefined;
  const staticRoot = process.env["HBOX_WEB_STATIC_ROOT"]?.trim() || undefined;
  const authToken = process.env["HBOX_SERVER_AUTH_TOKEN"]?.trim() || undefined;
  const topicResourcePeers = createTopicResourcePeers();
  const serverId = resolveHttpServerId();
  const { services, workspaceIdentityMapper, migrationFailedPathCount } =
    await createServerHostServices({
      topicResourceRelayChannel: (request) => topicResourcePeers.getChannel(request),
      sourceServerId: serverId,
      hboxBuiltinProviderConfigFilePath,
      providerProvisioningTargetEnabled: Boolean(authToken),
    });

  createHttpServer(services, port, {
    serverId,
    workspaceIdentityMapper,
    migrationFailedPathCount,
    virtualProjects: true,
    topicResourcePeers,
    ...(host ? { host } : {}),
    ...(staticRoot ? { staticRoot, spaFallback: true } : {}),
    ...(authToken ? { authToken, authRequired: true } : {}),
  });
}

void main().catch((error: unknown) => {
  console.error("[hbox-server:http] startup failed", error);
  process.exitCode = 1;
});
