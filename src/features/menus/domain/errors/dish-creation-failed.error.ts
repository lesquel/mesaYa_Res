import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class DishCreationFailedError extends BaseDomainError {
  constructor(reason?: string, details?: Record<string, unknown>) {
    super(`Dish creation failed${reason ? `: ${reason}` : ''}`, 500, details);
    this.name = DishCreationFailedError.name;
  }
}
