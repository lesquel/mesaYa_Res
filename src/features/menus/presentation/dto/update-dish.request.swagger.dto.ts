import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { UpdateDishDto } from '../../application/dtos/input/update-dish.dto';

export class UpdateDishRequestDto implements UpdateDishDto {
  @ApiPropertyOptional({
    description: 'Identificador del plato',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  dishId!: string;

  @ApiPropertyOptional({ description: 'Nombre del plato', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del plato' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Precio del plato', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Identificador de la imagen',
    nullable: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  imageId?: string | null;

  @ApiPropertyOptional({
    description: 'Identificador del menú al que pertenece el plato',
    nullable: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  menuId?: string | null;

  @ApiPropertyOptional({
    description: 'Identificador de la categoría del plato',
    nullable: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría del plato',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string | null;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  categoryDescription?: string | null;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  categoryOrder?: number | null;
}
