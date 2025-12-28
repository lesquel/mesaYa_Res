import type { PaginatedQueryParams } from '@shared/application/types';
import type { OwnerUpgradeRequestStatus } from '../../../domain/owner-upgrade-request-status.enum';

export interface ListOwnerUpgradeRequestsQuery extends PaginatedQueryParams {
  status?: OwnerUpgradeRequestStatus;
  userId?: string;
}
