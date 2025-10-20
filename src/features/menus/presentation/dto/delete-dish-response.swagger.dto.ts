import { ApiProperty } from '@nestjs/swagger';
import type { DeleteDishResponseDto } from '../../application/dtos/output/delete-dish-response.dto.js';

export class DeleteDishResponseSwaggerDto implements DeleteDishResponseDto {
  @ApiProperty({
    description: 'Identificador del plato eliminado',
    format: 'uuid',
  })
  dishId: string;
}
