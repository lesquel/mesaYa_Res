import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class MenuCreationFailedError extends BaseDomainError {
  constructor(reason?: string, details?: Record<string, unknown>) {
    super(`Menu creation failed${reason ? `: ${reason}` : ''}`, 500, details);
    this.name = MenuCreationFailedError.name;
  }
}
