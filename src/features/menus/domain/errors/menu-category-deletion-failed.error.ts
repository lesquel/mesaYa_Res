import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuCategoryDeletionFailedError extends BaseDomainError {
  constructor(categoryId: string, reason?: string) {
    super(
      `Menu category deletion failed for '${categoryId}'${reason ? `: ${reason}` : ''}`,
      500,
      { categoryId },
    );
    this.name = MenuCategoryDeletionFailedError.name;
  }
}