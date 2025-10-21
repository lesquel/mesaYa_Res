export class PaymentTargetAmbiguityError extends Error {
  constructor() {
    super(
      'Payment must target exactly one aggregate (reservation or subscription)',
    );
    this.name = PaymentTargetAmbiguityError.name;
  }
}
