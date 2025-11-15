import { OwnerUpgradeRequestEntity } from '../../domain/owner-upgrade-request.entity';
import { OwnerUpgradeRequestStatus } from '../../domain/owner-upgrade-request-status.enum';

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
}
