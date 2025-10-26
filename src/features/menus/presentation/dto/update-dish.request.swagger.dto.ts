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
}
