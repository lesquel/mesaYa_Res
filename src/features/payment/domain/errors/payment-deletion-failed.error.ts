import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

export class PaymentDeletionFailedError extends BaseDomainError {
  constructor(paymentId: string, reason?: string) {
    super(
      `Failed to delete payment with ID '${paymentId}'${reason ? `: ${reason}` : ''}`,
      500,
      { paymentId },
    );
    this.name = PaymentDeletionFailedError.name;
  }
}
