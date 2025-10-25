import { ApiProperty } from '@nestjs/swagger';
import type { MenuDto } from '../../application/dtos/output/menu.dto';
import { DishResponseSwaggerDto } from './dish-response.swagger.dto';

export class MenuResponseSwaggerDto implements MenuDto {
  @ApiProperty({
    description: 'Identificador del menú',
    format: 'uuid',
    required: false,
  })
  menuId: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  restaurantId: string;

  @ApiProperty({ description: 'Nombre del menú' })
  name: string;

  @ApiProperty({ description: 'Descripción del menú' })
  description: string;

  @ApiProperty({ description: 'Precio del menú', example: 15.5 })
  price: number;

  @ApiProperty({ description: 'URL de la imagen' })
  imageUrl: string;

  @ApiProperty({
    description: 'Platos del menú',
    type: () => DishResponseSwaggerDto,
    isArray: true,
    required: false,
  })
  dishes?: DishResponseSwaggerDto[];
}
