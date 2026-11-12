import { buildRuntimeHboxApiUrl, resolveZaiBusinessBaseUrl } from "@hbox/shared";

export const HBOX_CLIENT_SCENES_URL = buildRuntimeHboxApiUrl(
  process.env,
  "/api/v1/client/scenes",
);

export const ZAI_API_HOST = resolveZaiBusinessBaseUrl(process.env);
