import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { CreateMenuCategoryDto } from '@features/menus/application/dtos/input';

export class CreateMenuCategoryRequestDto implements CreateMenuCategoryDto {
  @ApiProperty({
    description: 'Identificador del restaurante',
    example: '1001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Entradas',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Ícono representativo' })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiPropertyOptional({ description: 'Orden de presentación', example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number | null;

  @ApiPropertyOptional({
    description: 'Indica si la categoría está activa',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
