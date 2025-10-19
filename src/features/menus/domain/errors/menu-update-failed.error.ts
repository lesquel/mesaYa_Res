import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuUpdateFailedError extends BaseDomainError {
  constructor(menuId: string, reason?: string) {
    super(
      `Menu update failed for '${menuId}'${reason ? `: ${reason}` : ''}`,
      500,
      { menuId },
    );
    this.name = MenuUpdateFailedError.name;
  }
}
