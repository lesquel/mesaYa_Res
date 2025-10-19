import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuDeletionFailedError extends BaseDomainError {
  constructor(menuId: string, reason?: string) {
    super(
      `Menu deletion failed for '${menuId}'${reason ? `: ${reason}` : ''}`,
      500,
      { menuId },
    );
    this.name = MenuDeletionFailedError.name;
  }
}
