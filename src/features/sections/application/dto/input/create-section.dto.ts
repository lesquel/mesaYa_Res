import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsPositive,
} from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateSectionDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Section name', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @trim()
  name: string;

  @ApiPropertyOptional({ description: 'Optional section description' })
  @IsOptional()
  @IsString()
  @trim()
  description?: string;

  @ApiProperty({ description: 'Section width', minimum: 1, type: Number })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  width: number;

  @ApiProperty({ description: 'Section height', minimum: 1, type: Number })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  height: number;
}

export type CreateSectionCommand = CreateSectionDto;
