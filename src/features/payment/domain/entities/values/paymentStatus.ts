export class PaymentStatus {
  private static readonly validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
  constructor(private value: string) {
    if (!PaymentStatus.validStatuses.includes(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
  }
  get status(): string {
    return this.value;
  }

  changeStatus(newStatus: string): void {
    if (!PaymentStatus.validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.value = newStatus;
  }
}
