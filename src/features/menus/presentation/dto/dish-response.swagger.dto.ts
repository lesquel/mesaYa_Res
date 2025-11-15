import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DishDto } from '../../application/dtos/output/dish.dto';

export class DishResponseSwaggerDto implements DishDto {
  @ApiProperty({
    description: 'Identificador del plato',
    format: 'uuid',
    required: false,
  })
  dishId?: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  restaurantId: string;

  @ApiProperty({ description: 'Nombre del plato' })
  name: string;

  @ApiProperty({ description: 'Descripción del plato' })
  description: string;

  @ApiProperty({ description: 'Precio del plato', example: 8.99 })
  price: number;

  @ApiProperty({
    description: 'Identificador de la imagen',
    required: false,
    nullable: true,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  imageId?: string | null;

  @ApiProperty({
    description: 'Identificador del menú al que pertenece',
    required: false,
    nullable: true,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  menuId?: string | null;

  @ApiPropertyOptional({
    description: 'Identificador de la categoría',
    nullable: true,
    format: 'uuid',
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría del plato',
    maxLength: 100,
  })
  categoryName?: string | null;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    nullable: true,
  })
  categoryDescription?: string | null;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría',
    minimum: 0,
  })
  categoryOrder?: number | null;

  @ApiProperty({
    description: 'Fecha de creación del plato',
    type: Date,
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del plato',
    type: Date,
    example: '2025-01-20T14:45:00Z',
  })
  updatedAt: Date;
}
