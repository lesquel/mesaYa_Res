import { MoneyVO } from '@shared/domain/entities/values';
import { PaymentStatusVO } from '../entities/values';
import { ReservationEntity } from '@features/reservation';
import { SubscriptionEntity } from '@features/subscription/domain/entities';

export interface PaymentCreate {
  reservation?: ReservationEntity;
  subscription?: SubscriptionEntity;
  amount: MoneyVO;
  paymentStatus: PaymentStatusVO;
}
