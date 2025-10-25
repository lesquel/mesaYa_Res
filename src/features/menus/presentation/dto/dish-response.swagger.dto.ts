import { ApiProperty } from '@nestjs/swagger';
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
}
