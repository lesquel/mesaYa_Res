export class PaymentAlreadySettledError extends Error {
  constructor(targetId: string) {
    super(`Payment target ${targetId} is already settled`);
    this.name = PaymentAlreadySettledError.name;
  }
}
