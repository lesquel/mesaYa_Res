import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class SubscriptionCreationFailedError extends BaseDomainError {
  constructor(details?: Record<string, unknown>) {
    super('Failed to create subscription', 422, details);
    this.name = SubscriptionCreationFailedError.name;
  }
}
