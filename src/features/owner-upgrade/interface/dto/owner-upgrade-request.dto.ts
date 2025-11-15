import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class OwnerUpgradeRequestDto {
  @ApiProperty({ example: 'Restaurante la Esquina', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  restaurantName: string;

  @ApiProperty({ example: 'Av. Central 123, Quito', type: 'string' })
  @IsString()
  restaurantLocation: string;

  @ApiProperty({
    example: 'Cocina fusión y cartas degustación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  restaurantDescription?: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  subscriptionPlanId?: string;

  @ApiProperty({
    example: 'Tengo experiencia atendiendo 150 comensales diarios',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
