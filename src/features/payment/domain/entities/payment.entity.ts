import { ReservationEntity as ReservationEntity } from '@features/reservation';
import { PaymentTypeEnum } from '../enums';
import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import { PaymentStatusVO } from './values';
import { SubscriptionEntity } from '@features/subscription/domain/entities';
import { MoneyVO } from '@shared/domain/entities/values';

export class PaymentEntity {
  constructor(
    private readonly _paymentId: string,
    private readonly _amount: MoneyVO,
    private readonly _date: Date,
    private _paymentStatus: PaymentStatusVO,
    private readonly _reservation?: ReservationEntity,
    private readonly _subscription?: SubscriptionEntity,
  ) {}

  get paymentId(): string {
    return this._paymentId;
  }

  get reservation(): ReservationEntity | undefined {
    return this._reservation;
  }

  get subscription(): SubscriptionEntity | undefined {
    return this._subscription;
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
    if (this._reservation) return PaymentTypeEnum.RESERVATION;
    if (this._subscription) return PaymentTypeEnum.SUBSCRIPTION;
    throw new PaymentMustBeAssociatedError();
  }
}
