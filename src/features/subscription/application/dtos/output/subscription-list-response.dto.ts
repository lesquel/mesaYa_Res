import { PaginatedResult } from '@shared/application/types/pagination';
import { SubscriptionDto } from './subscription.dto';

export type SubscriptionListResponseDto = PaginatedResult<SubscriptionDto>;
