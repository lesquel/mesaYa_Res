import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class SubscriptionNotFoundError extends BaseDomainError {
  constructor(subscriptionId: string) {
    super(`Subscription with id ${subscriptionId} was not found`, 404, {
      subscriptionId,
    });
    this.name = SubscriptionNotFoundError.name;
  }
}
