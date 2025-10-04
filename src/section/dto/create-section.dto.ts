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
  @ApiProperty({
    example: '8c0e8e7d-4e0c-4c3a-9a3f-1a7b6a1b2c3d',
    format: 'uuid',
  })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ example: 'Patio', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @trim()
  name: string;

  @ApiPropertyOptional({ example: 'Mesas al aire libre' })
  @IsOptional()
  @IsString()
  @trim()
  description?: string;
}
