import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../entities/values';

export interface SubscriptionPlanCreate {
  name: string;
  price: MoneyVO;
  subscriptionPeriod: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan: SubscriptionPlanStateVO;
}
