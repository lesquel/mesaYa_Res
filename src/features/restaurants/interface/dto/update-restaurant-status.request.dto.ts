import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RestaurantStatusEnum {
  DRAFT = 'DRAFT',
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
  @MaxLength(250)
  note?: string;
}
