import { ApiProperty } from '@nestjs/swagger';
import type { MenuDto } from '../../application/dtos/output/menu.dto.js';
import { DishResponseSwaggerDto } from './dish-response.swagger.dto.js';

export class MenuResponseSwaggerDto implements MenuDto {
  @ApiProperty({
    description: 'Identificador del menú',
    format: 'uuid',
    required: false,
  })
  menuId?: string;

  @ApiProperty({ description: 'Identificador del restaurante', example: 1001 })
  restaurantId: number;

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
