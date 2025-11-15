import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { CreateDishDto } from '../../application/dtos/input/create-dish.dto';

export class CreateDishRequestDto implements CreateDishDto {
  @ApiProperty({
    description: 'Identificador del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  restaurantId: string;

  @ApiProperty({ description: 'Nombre del plato', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del plato' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Precio del plato', example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Identificador de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  imageId?: string;

  @ApiPropertyOptional({
    description: 'Identificador del menú al que pertenece el plato',
    nullable: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiPropertyOptional({
    description: 'Identificador de la categoría del plato',
    nullable: true,
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-ab12-34567890cdef',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría del plato',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string;

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
  categoryOrder?: number;
}
