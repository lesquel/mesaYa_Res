export class PaymentForbiddenError extends Error {
  constructor(message = 'Payment action forbidden') {
    super(message);
    this.name = PaymentForbiddenError.name;
  }
}
