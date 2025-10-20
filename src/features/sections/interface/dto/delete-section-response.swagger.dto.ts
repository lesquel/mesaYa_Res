import { ApiProperty } from '@nestjs/swagger';
import type { DeleteSectionResponseDto } from '../../application/dto/output/delete-section.response.dto.js';
import { SectionResponseSwaggerDto } from './section-response.swagger.dto.js';

export class DeleteSectionResponseSwaggerDto
  implements DeleteSectionResponseDto
{
  @ApiProperty({
    description: 'Indica si la sección fue eliminada correctamente',
  })
  ok: boolean;

  @ApiProperty({
    description: 'Información de la sección eliminada',
    type: () => SectionResponseSwaggerDto,
  })
  section: SectionResponseSwaggerDto;
}
