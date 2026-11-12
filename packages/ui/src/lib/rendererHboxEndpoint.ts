import {
  buildRuntimeHboxEndpointUrls,
  HBOX_ENV,
  type RuntimeHboxEndpointEnv,
} from "@hbox/shared";

interface RendererImportMetaEnv {
  VITE_HBOX_BASE_URL?: string;
  VITE_HBOX_ENDPOINT_ORIGIN?: string;
}

function readRendererImportMetaEnv(): RendererImportMetaEnv {
  return ((import.meta as ImportMeta & { env?: RendererImportMetaEnv }).env ??
    {}) as RendererImportMetaEnv;
}

export function createRendererHboxEndpointEnv(
  env: RendererImportMetaEnv = readRendererImportMetaEnv(),
): RuntimeHboxEndpointEnv {
  return {
    HBOX_ENV,
    // UI 侧的 hbox-plan 占位 provider 以前只看 HBOX_ENV，
    // 没有消费 Vite 注入的 base url，导致自定义测试域名时 renderer 和 host/service 可能不一致。
    HBOX_BASE_URL: env.VITE_HBOX_BASE_URL,
    HBOX_ENDPOINT_ORIGIN: env.VITE_HBOX_ENDPOINT_ORIGIN,
  };
}

export const RENDERER_HBOX_ENDPOINT_URLS = buildRuntimeHboxEndpointUrls(
  createRendererHboxEndpointEnv(),
);
