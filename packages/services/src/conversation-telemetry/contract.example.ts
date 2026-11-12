import type { ConversationTelemetryFact } from "@hbox/shared/hbox-protocol-v4";
export const remoteTurnExample = {
  version: 1,
  eventId: "start",
  eventSeq: 1,
  occurredAt: 1,
  sessionId: "talk",
  sourceCommandId: "command",
  kind: "turn.started",
  inputOrigin: "mobile",
} satisfies ConversationTelemetryFact;
