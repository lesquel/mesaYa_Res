import type { PaginatedResult } from '@shared/application/types';
import type { OwnerUpgradeResponseDto } from '../../../interface/dto/owner-upgrade-response.dto';

export type PaginatedOwnerUpgradeResponse =
  PaginatedResult<OwnerUpgradeResponseDto>;
