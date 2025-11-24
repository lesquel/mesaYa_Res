import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuCategoryResponseDto } from '@features/menus/application/dtos/output';

export class MenuCategoryResponseSwaggerDto implements MenuCategoryResponseDto {
  @ApiProperty({
    description: 'Identificador de la categoría',
    example: '6a7c2e13-...',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    example: '5e8a9d41',
  })
  restaurantId: string;

  @ApiProperty({ description: 'Nombre de la categoría', example: 'Entradas' })
  name: string;

  @ApiPropertyOptional({ description: 'Descripción complementaria' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Ícono asociado a la categoría' })
  icon?: string | null;

  @ApiPropertyOptional({
    description: 'Ordenamiento de visualización',
    example: 10,
  })
  position?: number | null;

  @ApiProperty({ description: 'Bandera de activación', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación', type: String })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización', type: String })
  updatedAt: Date;
}
