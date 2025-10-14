import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class PaymentMustBeAssociatedError extends BaseDomainError {
  constructor(reason?: string, details?: Record<string, any>) {
    super(
      `Payment must be associated with either a reservation or a subscription${reason ? `: ${reason}` : ''}`,
      400,
      details,
    );
    this.name = PaymentMustBeAssociatedError.name;
  }
}
