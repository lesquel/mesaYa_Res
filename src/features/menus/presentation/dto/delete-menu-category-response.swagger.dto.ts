import { ApiProperty } from '@nestjs/swagger';
import { DeleteMenuCategoryResponseDto } from '@features/menus/application/dtos/output';

export class DeleteMenuCategoryResponseSwaggerDto
  implements DeleteMenuCategoryResponseDto
{
  @ApiProperty({ description: 'Identificador de la categoría eliminada' })
  categoryId: string;
}
