export class PaymentType {
  private static readonly validTypes = ['RESERVATION', 'SUBSCRIPTION'];
  constructor(private readonly value: string) {
    if (!PaymentType.validTypes.includes(value)) {
      throw new Error(`Invalid type: ${value}`);
    }
  }
  get type(): string {
    return this.value;
  }
}
