import { NotFoundError } from '@shared/domain/errors/not-found.error';

export class MenuNotFoundError extends NotFoundError {
  constructor(menuId: string) {
    super(`Menu with ID '${menuId}' not found`, { menuId });
    this.name = MenuNotFoundError.name;
  }
}
