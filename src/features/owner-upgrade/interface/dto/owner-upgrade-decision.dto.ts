import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OwnerUpgradeRequestStatus } from '../../domain/owner-upgrade-request-status.enum';

export class OwnerUpgradeDecisionDto {
  @ApiProperty({
    enum: [
      OwnerUpgradeRequestStatus.APPROVED,
      OwnerUpgradeRequestStatus.REJECTED,
    ],
    example: OwnerUpgradeRequestStatus.APPROVED,
  })
  @IsEnum(OwnerUpgradeRequestStatus)
  status: OwnerUpgradeRequestStatus;

  @ApiProperty({
    example: 'a5c1a8f9-1d1a-4f01-a0cb-3bebe7d8cfa1',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty({ example: 'El perfil es limpio, aprobar', required: false })
  @IsOptional()
  @IsString()
  adminMessage?: string;
}
