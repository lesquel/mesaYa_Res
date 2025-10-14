export class PaymentStatusVO {
  private static readonly validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
  constructor(private value: string) {
    if (!PaymentStatusVO.validStatuses.includes(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
  }
  get status(): string {
    return this.value;
  }

  changeStatus(newStatus: string): void {
    if (!PaymentStatusVO.validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.value = newStatus;
  }
}
