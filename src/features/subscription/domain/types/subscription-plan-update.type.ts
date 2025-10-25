import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../entities/values';

export interface SubscriptionPlanUpdate {
  subscriptionPlanId: string;
  name?: string;
  price?: MoneyVO;
  subscriptionPeriod?: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan?: SubscriptionPlanStateVO;
}
