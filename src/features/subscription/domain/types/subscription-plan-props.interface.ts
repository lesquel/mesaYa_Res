import type { MoneyVO } from '@shared/domain/entities/values';
import type {
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../entities/values';

export interface SubscriptionPlanProps {
  name: string;
  price: MoneyVO;
  subscriptionPeriod: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan: SubscriptionPlanStateVO;
  createdAt: Date;
  updatedAt: Date;
}
