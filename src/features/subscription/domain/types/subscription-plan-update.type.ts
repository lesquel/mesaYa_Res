import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../entities/values/index.js';

export interface SubscriptionPlanUpdate {
  subscriptionPlanId: string;
  name?: string;
  price?: MoneyVO;
  subscriptionPeriod?: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan?: SubscriptionPlanStateVO;
}
