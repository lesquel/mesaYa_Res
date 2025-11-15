import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';
import { MoneyVO } from '@shared/domain/entities/values/money.vo';
import { SubscriptionPlanStateVO } from '@features/subscription/domain/entities/values/subscription-plan-state.vo';
import { SubscriptionPlanPeriodVO } from '@features/subscription/domain/entities/values/subscription-plan-period.vo';

const planDefinitions = [
  {
    name: 'Plan Básico',
    price: 29.99,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Estándar',
    price: 79.99,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Premium',
    price: 249.99,
    period: SubscriptionPlanPeriodsEnum.YEARLY,
  },
  {
    name: 'Plan Empresarial',
    price: 149.99,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Platinum',
    price: 199.99,
    period: SubscriptionPlanPeriodsEnum.YEARLY,
  },
  {
    name: 'Plan Emprende',
    price: 59.99,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Corporativo',
    price: 320.0,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Innovación',
    price: 120.0,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Delivery',
    price: 49.99,
    period: SubscriptionPlanPeriodsEnum.MONTHLY,
  },
  {
    name: 'Plan Chef',
    price: 89.99,
    period: SubscriptionPlanPeriodsEnum.YEARLY,
  },
];

export const subscriptionPlanNames = planDefinitions.map((plan) => plan.name);

export const subscriptionPlansSeed = planDefinitions.map((plan) => ({
  name: plan.name,
  price: new MoneyVO(plan.price),
  subscriptionPeriod: SubscriptionPlanPeriodVO.create(plan.period),
  stateSubscriptionPlan: SubscriptionPlanStateVO.create(
    SubscriptionPlanStatesEnum.ACTIVE,
  ),
}));
