import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class SubscriptionPlanNotFoundError extends BaseDomainError {
  constructor(subscriptionPlanId: string) {
    super(
      `Subscription plan with id ${subscriptionPlanId} was not found`,
      404,
      {
        subscriptionPlanId,
      },
    );
    this.name = SubscriptionPlanNotFoundError.name;
  }
}
