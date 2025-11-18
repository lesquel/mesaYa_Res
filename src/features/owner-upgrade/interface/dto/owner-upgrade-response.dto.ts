import { ApiProperty } from '@nestjs/swagger';
import { OwnerUpgradeRequestEntity } from '../../domain/owner-upgrade-request.entity';
import { OwnerUpgradeRequestStatus } from '../../domain/owner-upgrade-request-status.enum';

export class OwnerUpgradeResponseDto {
  @ApiProperty({ example: 'c6f1d030-5d91-4135-a2bc-6518daf57843' })
  requestId: string;

  @ApiProperty({ example: '9e7d1f5b-2c34-4f40-82d8-1b2c3d4e5f67' })
  userId: string;

  @ApiProperty({ enum: OwnerUpgradeRequestStatus })
  status: OwnerUpgradeRequestStatus;

  @ApiProperty({ example: 'owner.upgrade.status.pending' })
  statusKey: string;

  @ApiProperty({ example: 'Restaurante la Esquina' })
  restaurantName: string;

  @ApiProperty({ example: 'Av. Central 123, Quito' })
  restaurantLocation: string;

  @ApiProperty({ example: 'Cocina fusión', required: false })
  restaurantDescription?: string | null;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  preferredSubscriptionPlanId?: string | null;

  @ApiProperty({
    example: 'Cuento con experiencia en eventos grandes',
    required: false,
  })
  userNote?: string | null;

  @ApiProperty({ example: 'Se requiere revisar antecedentes', required: false })
  adminNote?: string | null;

  @ApiProperty({
    example: 'a5c1a8f9-1d1a-4f01-a0cb-3bebe7d8cfa1',
    required: false,
  })
  assignedRestaurantId?: string | null;

  @ApiProperty({
    example: 'a1b2c3d4-1234-5678-90ab-abcdef123456',
    required: false,
  })
  processedBy?: string | null;

  @ApiProperty({ example: '2025-11-15T10:00:00Z', required: false })
  processedAt?: Date | null;

  @ApiProperty({ example: '2025-11-01T08:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-12T12:00:00Z' })
  updatedAt: Date;

  static fromEntity(
    entity: OwnerUpgradeRequestEntity,
  ): OwnerUpgradeResponseDto {
    const dto = new OwnerUpgradeResponseDto();

    dto.requestId = entity.requestId;
    dto.userId = entity.userId;
    dto.status = entity.status;
    dto.statusKey = `owner.upgrade.status.${entity.status.toLowerCase()}`;
    dto.restaurantName = entity.restaurantName;
    dto.restaurantLocation = entity.restaurantLocation;
    dto.restaurantDescription = entity.restaurantDescription;
    dto.preferredSubscriptionPlanId = entity.preferredSubscriptionPlanId;
    dto.userNote = entity.userNote;
    dto.adminNote = entity.adminNote;
    dto.assignedRestaurantId = entity.assignedRestaurantId;
    dto.processedBy = entity.processedBy;
    dto.processedAt = entity.processedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    return dto;
  }
}
