import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';

export const subscriptionPlansSeed = [
  {
    name: 'Plan Básico',
    price: 29.99,
    subscriptionPeriod: SubscriptionPlanPeriodsEnum.MONTHLY,
    stateSubscriptionPlan: SubscriptionPlanStatesEnum.ACTIVE,
  },
  {
    name: 'Plan Estándar',
    price: 79.99,
    subscriptionPeriod: SubscriptionPlanPeriodsEnum.MONTHLY,
    stateSubscriptionPlan: SubscriptionPlanStatesEnum.ACTIVE,
  },
  {
    name: 'Plan Premium',
    price: 249.99,
    subscriptionPeriod: SubscriptionPlanPeriodsEnum.YEARLY,
    stateSubscriptionPlan: SubscriptionPlanStatesEnum.ACTIVE,
  },
  {
    name: 'Plan Empresarial',
    price: 149.99,
    subscriptionPeriod: SubscriptionPlanPeriodsEnum.MONTHLY,
    stateSubscriptionPlan: SubscriptionPlanStatesEnum.ACTIVE,
  },
];
