import { MoneyVO } from '@shared/domain/entities/values';
import { PaymentTypeEnum } from '../enums';
import { PaymentMustBeAssociatedError } from '../errors/payment-must-be-associated.error';
import { PaymentStatusVO } from './values';

export interface PaymentProps {
  amount: MoneyVO;
  date: Date;
  paymentStatus: PaymentStatusVO;
  reservationId?: string;
  subscriptionId?: string;
}

export interface PaymentSnapshot extends PaymentProps {
  paymentId: string;
}

export class PaymentEntity {
  private constructor(
    private readonly _paymentId: string,
    private props: PaymentProps,
  ) {}

  static create(id: string, props: PaymentProps): PaymentEntity {
    this.validate(props);
    return new PaymentEntity(id, props);
  }

  snapshot(): PaymentSnapshot {
    return {
      paymentId: this._paymentId,
      ...this.props,
    };
  }
  static rehydrate(snapshot: PaymentSnapshot): PaymentEntity {
    return new PaymentEntity(snapshot.paymentId, { ...snapshot });
  }

  get id(): string {
    return this._paymentId;
  }

  get amount(): MoneyVO {
    return this.props.amount;
  }

  get date(): Date {
    return this.props.date;
  }

  get paymentStatus(): PaymentStatusVO {
    return this.props.paymentStatus;
  }

  get reservationId(): string | undefined {
    return this.props.reservationId;
  }

  get subscriptionId(): string | undefined {
    return this.props.subscriptionId;
  }

  updateStatus(newStatus: PaymentStatusVO): void {
    this.props.paymentStatus = newStatus;
  }

  get paymentType(): PaymentTypeEnum {
    if (reservationId){return PaymentTypeEnum.RESERVATION}
    else{
      return PaymentTypeEnum.SUBSCRIPTION
    }

  }

  private static validate(props: PaymentProps): void {
    if (!props.date) throw new Error('Payment must have a valid date');
    if (!props.paymentStatus)
      throw new Error('Payment must have a valid status');
    if (!props.reservationId && !props.subscriptionId)
      throw new PaymentMustBeAssociatedError();
  }
}
