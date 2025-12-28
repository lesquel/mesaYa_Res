import { PaginatedResult } from '@shared/application/types';
import { SubscriptionPlanDto } from './subscription-plan.dto';

export type SubscriptionPlanListResponseDto =
  PaginatedResult<SubscriptionPlanDto>;
