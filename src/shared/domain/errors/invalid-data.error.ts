import { BaseDomainError } from './base-domain-error';

export class InvalidInfoError extends BaseDomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
    this.name = InvalidInfoError.name;
  }
}
