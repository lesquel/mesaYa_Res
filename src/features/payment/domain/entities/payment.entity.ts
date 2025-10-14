import { PaymentTypeEnum } from '../enums';
import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import { MoneyVO, PaymentStatusVO } from './values';

export class PaymentEntity {
  constructor(
    private readonly _paymentId: string,
    private readonly _amount: MoneyVO,
    private readonly _date: Date,
    private _paymentStatus: PaymentStatusVO,
    private readonly _reservationId?: string,
    private readonly _subscriptionId?: string,
  ) {}

  get paymentId(): string {
    return this._paymentId;
  }

  get reservationId(): string | undefined {
    return this._reservationId;
  }

  get subscriptionId(): string | undefined {
    return this._subscriptionId;
  }

  get amount(): MoneyVO {
    return this._amount;
  }

  get date(): Date {
    return this._date;
  }

  get paymentStatus(): PaymentStatusVO {
    return this._paymentStatus;
  }

  updateStatus(newStatus: PaymentStatusVO): void {
    this._paymentStatus = newStatus;
  }

  paymentType(): PaymentTypeEnum {
    if (this._reservationId) return PaymentTypeEnum.RESERVATION;
    if (this._subscriptionId) return PaymentTypeEnum.SUBSCRIPTION;
    throw new PaymentMustBeAssociatedError();
  }
}
