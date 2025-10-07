import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class PaymentCreationFailedError extends BaseDomainError {
  constructor(reason?: string, details?: Record<string, any>) {
    super(
      `Payment creation failed${reason ? `: ${reason}` : ''}`,
      500,
      details,
    );
    this.name = PaymentCreationFailedError.name;
  }
}
