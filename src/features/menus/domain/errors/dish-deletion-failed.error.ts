import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class DishDeletionFailedError extends BaseDomainError {
  constructor(dishId: string, reason?: string) {
    super(
      `Dish deletion failed for '${dishId}'${reason ? `: ${reason}` : ''}`,
      500,
      { dishId },
    );
    this.name = DishDeletionFailedError.name;
  }
}
