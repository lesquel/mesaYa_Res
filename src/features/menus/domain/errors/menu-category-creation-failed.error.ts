import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuCategoryCreationFailedError extends BaseDomainError {
  constructor(restaurantId: string, reason?: string) {
    super(
      `Menu category creation failed for restaurant '${restaurantId}'${reason ? `: ${reason}` : ''}`,
      500,
      { restaurantId },
    );
    this.name = MenuCategoryCreationFailedError.name;
  }
}