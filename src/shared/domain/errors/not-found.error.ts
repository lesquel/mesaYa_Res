import { BaseDomainError } from './base-domain-error';

export class NotFoundError extends BaseDomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 404, details);
    this.name = NotFoundError.name;
  }
}
