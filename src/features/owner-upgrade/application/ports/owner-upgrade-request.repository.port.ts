import { OwnerUpgradeRequestEntity } from '../../domain/owner-upgrade-request.entity';
import { OwnerUpgradeRequestStatus } from '../../domain/owner-upgrade-request-status.enum';
import type { PaginatedResult } from '@shared/application/types/pagination';
import type { ListOwnerUpgradeRequestsQuery } from '../dto';

export interface OwnerUpgradeRequestRepositoryPort {
  create(
    request: OwnerUpgradeRequestEntity,
  ): Promise<OwnerUpgradeRequestEntity>;
  update(
    request: OwnerUpgradeRequestEntity,
  ): Promise<OwnerUpgradeRequestEntity>;
  findPendingByUserId(
    userId: string,
    status?: OwnerUpgradeRequestStatus,
  ): Promise<OwnerUpgradeRequestEntity | null>;
  findById(id: string): Promise<OwnerUpgradeRequestEntity | null>;
  paginate(
    query: ListOwnerUpgradeRequestsQuery,
  ): Promise<PaginatedResult<OwnerUpgradeRequestEntity>>;
}
