export class PaymentExceedsOutstandingError extends Error {
  constructor(amount: number, outstanding: number) {
    super(
      `Payment amount ${amount.toFixed(2)} exceeds outstanding balance ${outstanding.toFixed(2)}`,
    );
    this.name = PaymentExceedsOutstandingError.name;
  }
}
