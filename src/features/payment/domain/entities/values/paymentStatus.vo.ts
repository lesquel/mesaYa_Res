import { PaymentStatusEnum } from '../../enums';

export class PaymentStatusVO {
  private static readonly validStatuses = Object.values(PaymentStatusEnum);

  constructor(private value: PaymentStatusEnum) {
    if (!PaymentStatusVO.validStatuses.includes(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
  }

  get status(): PaymentStatusEnum {
    return this.value;
  }

  changeStatus(newStatus: PaymentStatusEnum): void {
    if (!PaymentStatusVO.validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.value = newStatus;
  }
}
