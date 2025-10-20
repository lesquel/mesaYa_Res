import { ApiProperty } from '@nestjs/swagger';
import type { DishDto } from '../../application/dtos/output/dish.dto.js';

export class DishResponseSwaggerDto implements DishDto {
  @ApiProperty({
    description: 'Identificador del plato',
    format: 'uuid',
    required: false,
  })
  dishId?: string;

  @ApiProperty({ description: 'Identificador del restaurante', example: 1001 })
  restaurantId: number;

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
    example: 5,
  })
  imageId?: number | null;
}
