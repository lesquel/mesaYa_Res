import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class PaymentUpdateFailedError extends BaseDomainError {
  constructor(paymentId: string, reason?: string) {
    super(
      `Failed to update payment with ID '${paymentId}'${reason ? `: ${reason}` : ''}`,
      500,
      { paymentId },
    );
    this.name = PaymentUpdateFailedError.name;
  }
}
