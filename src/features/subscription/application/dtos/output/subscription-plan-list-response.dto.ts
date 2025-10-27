import { PaginatedResult } from '@shared/application/types/pagination';
import { SubscriptionPlanDto } from './subscription-plan.dto';

export type SubscriptionPlanListResponseDto =
  PaginatedResult<SubscriptionPlanDto>;
