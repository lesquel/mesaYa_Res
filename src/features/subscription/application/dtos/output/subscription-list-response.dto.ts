import { PaginatedResult } from '@shared/application/types';
import { SubscriptionDto } from './subscription.dto';

export type SubscriptionListResponseDto = PaginatedResult<SubscriptionDto>;
