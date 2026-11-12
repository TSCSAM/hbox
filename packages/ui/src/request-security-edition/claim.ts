import type { ICodingPlanSubscriptionService } from "@hbox/services";
import type { RequestVerificationProof } from "@hbox/shared";
export function useRequestVerificationPrewarm(_visible: boolean): void {}
export async function prepareRequestVerificationClaim(
  _service: ICodingPlanSubscriptionService,
  signal: AbortSignal,
  _onVerifying: () => void,
): Promise<RequestVerificationProof | undefined> {
  signal.throwIfAborted();
  return {};
}
