import type { PipSessionEvent } from "@hbox/hbox-cua/pip-session";
import { ServiceChannels } from "@hbox/shared";

import { createServiceDescriptor } from "../descriptors.js";

type FocusEvent = Extract<PipSessionEvent, { kind: "focus-changed" }>;
type LifecycleEvent = Exclude<PipSessionEvent, FocusEvent>;

export interface CuaPipSessionService {
  publishFocus(event: FocusEvent): Promise<void>;
  publishLifecycle(event: LifecycleEvent): Promise<void>;
  dispose(): void;
}

export const ICuaPipSessionService = createServiceDescriptor<CuaPipSessionService>(
  ServiceChannels.CuaPipSession,
);
