import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuCategoryNotFoundError extends BaseDomainError {
  constructor(categoryId: string) {
    super(`Menu category '${categoryId}' not found`, 404, { categoryId });
    this.name = MenuCategoryNotFoundError.name;
  }
}
