import { MoneyVO } from '@shared/domain/entities/values';
import {
  SubscriptionPlanPeriodVO,
  SubscriptionPlanStateVO,
} from '../entities/values/index.js';

export interface SubscriptionPlanCreate {
  name: string;
  price: MoneyVO;
  subscriptionPeriod: SubscriptionPlanPeriodVO;
  stateSubscriptionPlan: SubscriptionPlanStateVO;
}
