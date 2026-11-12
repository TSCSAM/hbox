import {
  DEFAULT_FEEDBACK_TICKET_FRAMEWORK,
  type HboxProvider,
  type FeedbackTicketFramework,
} from "@hbox/shared";

export function inferFeedbackFrameworkFromAgentProvider(
  _provider: HboxProvider | null | undefined,
): FeedbackTicketFramework {
  return DEFAULT_FEEDBACK_TICKET_FRAMEWORK;
}
