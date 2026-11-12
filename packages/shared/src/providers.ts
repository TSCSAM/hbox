import { z } from "zod";

/**
 * Hbox agent 提供方的单一真源。
 *
 * 类型 HboxProvider、运行时 schema hboxProviderSchema 都从这里派生,
 * 避免各处内联 z.enum([...]) 副本随新增/删除 provider 漂移。
 * 本模块只依赖 zod(叶子),可被 validation / hbox-protocol 等无环引用。
 */
export const HBOX_PROVIDERS = ["glm"] as const;

export const hboxProviderSchema = z.enum(HBOX_PROVIDERS);

export type HboxProvider = (typeof HBOX_PROVIDERS)[number];
