import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RestaurantStatusEnum {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateRestaurantStatusRequestDto {
  @ApiProperty({ enum: RestaurantStatusEnum })
  @IsEnum(RestaurantStatusEnum)
  status: RestaurantStatusEnum;

  @ApiProperty({
    required: false,
    description: 'Optional admin note for the status change',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
