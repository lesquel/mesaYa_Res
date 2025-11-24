import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuCategoryUpdateFailedError extends BaseDomainError {
  constructor(categoryId: string, reason?: string) {
    super(
      `Menu category update failed for '${categoryId}'${reason ? `: ${reason}` : ''}`,
      500,
      { categoryId },
    );
    this.name = MenuCategoryUpdateFailedError.name;
  }
}