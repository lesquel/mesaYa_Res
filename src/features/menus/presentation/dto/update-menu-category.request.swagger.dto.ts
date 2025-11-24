import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { UpdateMenuCategoryDto } from '@features/menus/application/dtos/input';

export class UpdateMenuCategoryRequestDto implements UpdateMenuCategoryDto {
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

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
