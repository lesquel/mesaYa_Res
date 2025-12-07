import { BaseDomainError } from './base-domain-error';

export class InvalidDataError extends BaseDomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, details);
    this.name = InvalidInfoError.name;
  }
}
