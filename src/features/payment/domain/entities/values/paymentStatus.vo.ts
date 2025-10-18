import { PaymentStatusEnum } from '../../enums';

export class PaymentStatusVO {
  private constructor(private value: PaymentStatusEnum) {}

  static create(value: PaymentStatusEnum): PaymentStatusVO {
    this.validateStatus(value);
    return new PaymentStatusVO(value);
  }

  get status(): PaymentStatusEnum {
    return this.value;
  }

  changeStatus(newStatus: PaymentStatusEnum): void {
    PaymentStatusVO.validateStatus(newStatus);
    this.value = newStatus;
  }

  private static validateStatus(value: PaymentStatusEnum): void {
    if (!Object.values(PaymentStatusEnum).includes(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
  }
}
