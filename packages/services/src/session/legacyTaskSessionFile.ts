import type { HboxSessionFile, HboxTaskMeta } from "@hbox/shared";
import { hboxSessionFileSchema, hboxTaskMetaSchema, hboxTaskModeSchema } from "@hbox/shared";

export type LegacyTaskSessionFile = Omit<HboxSessionFile, "meta"> & {
  meta: Omit<HboxTaskMeta, "mode"> & { mode?: HboxTaskMeta["mode"] };
};

const legacyTaskSessionFileSchema = hboxSessionFileSchema.extend({
  // Claude 原生迁移会按清洗路径删除 meta.mode。
  // legacy snapshot 读取/写入仍要校验其它必需字段，但不能再强制把被过滤字段补回文件。
  meta: hboxTaskMetaSchema.extend({
    mode: hboxTaskModeSchema.optional(),
  }),
});

export function parseLegacyTaskSessionFile(input: unknown): LegacyTaskSessionFile {
  return legacyTaskSessionFileSchema.parse(input);
}

export function safeParseLegacyTaskSessionFile(input: unknown) {
  return legacyTaskSessionFileSchema.safeParse(input);
}
