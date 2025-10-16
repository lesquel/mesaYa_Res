import { NotFoundError } from '@shared/domain/errors/not-found.error';

export class PaymentNotFoundError extends NotFoundError {
  constructor(paymentId: string) {
    super(`Payment with ID '${paymentId}' not found`, { paymentId });
    this.name = PaymentNotFoundError.name;
  }
}
