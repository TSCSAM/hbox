import type { Event, IDisposable } from "@hbox/rpc";
import type { HboxProtocolMessage } from "@hbox/shared";

export type HboxProtocolTransportKind = "stdio" | "websocket" | "memory";

export interface HboxProtocolTransportClosedEvent {
  code?: number | null;
  signal?: NodeJS.Signals | null;
  reason?: string;
}

export interface HboxProtocolTransport extends IDisposable {
  readonly kind: HboxProtocolTransportKind;
  readonly onMessage: Event<HboxProtocolMessage>;
  readonly onClose: Event<HboxProtocolTransportClosedEvent>;
  send(message: HboxProtocolMessage): Promise<void>;
  disposeAndWait?(): Promise<void>;
}
