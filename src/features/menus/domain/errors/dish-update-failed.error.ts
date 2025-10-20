import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class DishUpdateFailedError extends BaseDomainError {
  constructor(dishId: string, reason?: string) {
    super(
      `Dish update failed for '${dishId}'${reason ? `: ${reason}` : ''}`,
      500,
      { dishId },
    );
    this.name = DishUpdateFailedError.name;
  }
}
