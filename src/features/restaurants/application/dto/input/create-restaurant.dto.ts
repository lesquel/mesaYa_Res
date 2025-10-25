import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RestaurantDay } from '../../../domain/index';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateRestaurantDto {
  @ApiProperty({ example: 'My Resto', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  name: string;

  @ApiPropertyOptional({ example: 'Casual dining with local flavors' })
  @IsOptional()
  @IsString()
  @trim()
  description?: string;

  @ApiProperty({ example: 'Downtown - Main St 123', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @trim()
  location: string;

  @ApiProperty({ example: '09:00', description: 'Formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  openTime: string;

  @ApiProperty({ example: '18:00', description: 'Formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  closeTime: string;

  @ApiProperty({
    type: [String],
    example: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
    description: 'Días de apertura',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    { each: true },
  )
  daysOpen: RestaurantDay[];

  @ApiProperty({ example: 50, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCapacity: number;

  @ApiProperty({ example: 'abc123-uuid-subscription' })
  @IsString()
  subscriptionId: string;

  @ApiPropertyOptional({ example: 'abc123-uuid-image' })
  @IsOptional()
  @IsString()
  imageId?: string;
}

export type CreateRestaurantCommand = CreateRestaurantDto & {
  ownerId: string;
};
