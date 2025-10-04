import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
  MaxLength,
  Min,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';

// Utilidad para recortar strings entrantes
const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  name: string;

  @IsOptional()
  @IsString()
  @trim()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @trim()
  location: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  openTime: string; // HH:mm

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  closeTime: string; // HH:mm

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
  daysOpen: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCapacity: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subscriptionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  imageId?: number;
}
