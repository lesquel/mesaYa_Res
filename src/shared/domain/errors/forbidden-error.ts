import { BaseDomainError } from './base-domain-error';

export class ForbiddenError extends BaseDomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 403, details);

    this.name = ForbiddenError.name;
  }
}
