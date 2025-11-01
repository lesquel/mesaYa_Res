export class PaymentTargetNotFoundError extends Error {
  constructor(
    target: 'reservation' | 'subscription' | 'restaurant',
    identifier: string,
  ) {
    super(`Payment target ${target} not found: ${identifier}`);
    this.name = PaymentTargetNotFoundError.name;
  }
}
