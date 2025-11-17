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
  IsUUID,
  ValidateNested,
  IsNumber,
  MinLength,
  Max,
} from 'class-validator';
import { RestaurantDay } from '../../../domain/index';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const normalizeLegacyLocation = () =>
  Transform(({ value }) => {
    if (typeof value === 'string') {
      const label = value.trim();
      return {
        address: label,
        city: label,
        country: label,
      } as Partial<RestaurantLocationDto>;
    }

    return value;
  });

export class RestaurantLocationDto {
  @ApiProperty({ example: 'Av. Amazonas 200 y Colón' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @trim()
  address!: string;

  @ApiProperty({ example: 'Quito' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @trim()
  city!: string;

  @ApiPropertyOptional({ example: 'Pichincha' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @trim()
  province?: string;

  @ApiProperty({ example: 'Ecuador' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @trim()
  country!: string;

  @ApiPropertyOptional({ description: 'Latitud del mapa', example: -0.180653 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitud del mapa', example: -78.467834 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Identificador del lugar (Google Place ID, etc.)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @trim()
  placeId?: string;
}

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

  @ApiProperty({ type: RestaurantLocationDto })
  @normalizeLegacyLocation()
  @ValidateNested()
  @Type(() => RestaurantLocationDto)
  location!: RestaurantLocationDto;

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

  @ApiProperty({ example: '9a4d5c78-3d9f-427c-9f5c-a4c9b6f0c2d1' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  subscriptionId: string;

  @ApiPropertyOptional({ example: '5e2f7c1a-0d83-4fe1-bbe6-01baf2ea9871' })
  @IsOptional()
  @IsString()
  @IsUUID()
  imageId?: string;
}

export type CreateRestaurantCommand = CreateRestaurantDto & {
  ownerId: string;
};
