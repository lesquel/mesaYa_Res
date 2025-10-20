import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class SubscriptionPlanInactiveError extends BaseDomainError {
  constructor(subscriptionPlanId: string) {
    super(
      `Cannot use subscription plan ${subscriptionPlanId} because it is not active`,
      409,
      {
        subscriptionPlanId,
      },
    );
    this.name = SubscriptionPlanInactiveError.name;
  }
}
