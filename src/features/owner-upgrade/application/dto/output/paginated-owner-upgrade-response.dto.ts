import type { PaginatedResult } from '@shared/application/types/pagination';
import type { OwnerUpgradeResponseDto } from '../../../interface/dto/owner-upgrade-response.dto';

export type PaginatedOwnerUpgradeResponse =
  PaginatedResult<OwnerUpgradeResponseDto>;
