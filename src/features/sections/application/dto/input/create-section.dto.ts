import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
}

export type CreateSectionCommand = CreateSectionDto;
