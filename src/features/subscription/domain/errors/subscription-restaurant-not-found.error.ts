import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class SubscriptionRestaurantNotFoundError extends BaseDomainError {
  constructor(restaurantId: string) {
    super(`Restaurant with id ${restaurantId} was not found`, 404, {
      restaurantId,
    });
    this.name = SubscriptionRestaurantNotFoundError.name;
  }
}
