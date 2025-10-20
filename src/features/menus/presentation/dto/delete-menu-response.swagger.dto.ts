import { ApiProperty } from '@nestjs/swagger';
import type { DeleteMenuResponseDto } from '../../application/dtos/output/delete-menu-response.dto.js';

export class DeleteMenuResponseSwaggerDto implements DeleteMenuResponseDto {
  @ApiProperty({
    description: 'Identificador del menú eliminado',
    format: 'uuid',
  })
  menuId: string;
}
