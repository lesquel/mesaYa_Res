import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';
import { MoneyVO } from '@shared/domain/entities/values/money.vo';
import { SubscriptionPlanStateVO } from '@features/subscription/domain/entities/values/subscription-plan-state.vo';
import { SubscriptionPlanPeriodVO } from '@features/subscription/domain/entities/values/subscription-plan-period.vo';

export const subscriptionPlansSeed = [
  {
    name: 'Plan Básico',
    price: new MoneyVO(29.99),
    subscriptionPeriod: SubscriptionPlanPeriodVO.create(
      SubscriptionPlanPeriodsEnum.MONTHLY,
    ),
    stateSubscriptionPlan: SubscriptionPlanStateVO.create(
      SubscriptionPlanStatesEnum.ACTIVE,
    ),
  },
  {
    name: 'Plan Estándar',
    price: new MoneyVO(79.99),
    subscriptionPeriod: SubscriptionPlanPeriodVO.create(
      SubscriptionPlanPeriodsEnum.MONTHLY,
    ),
    stateSubscriptionPlan: SubscriptionPlanStateVO.create(
      SubscriptionPlanStatesEnum.ACTIVE,
    ),
  },
  {
    name: 'Plan Premium',
    price: new MoneyVO(249.99),
    subscriptionPeriod: SubscriptionPlanPeriodVO.create(
      SubscriptionPlanPeriodsEnum.YEARLY,
    ),
    stateSubscriptionPlan: SubscriptionPlanStateVO.create(
      SubscriptionPlanStatesEnum.ACTIVE,
    ),
  },
  {
    name: 'Plan Empresarial',
    price: new MoneyVO(149.99),
    subscriptionPeriod: SubscriptionPlanPeriodVO.create(
      SubscriptionPlanPeriodsEnum.MONTHLY,
    ),
    stateSubscriptionPlan: SubscriptionPlanStateVO.create(
      SubscriptionPlanStatesEnum.ACTIVE,
    ),
  },
];
