import { ApiProperty } from '@nestjs/swagger';
import type { SectionResponseDto } from '../../application/dto/output/section.response.dto';

export class SectionResponseSwaggerDto implements SectionResponseDto {
  @ApiProperty({
    description: 'Identificador de la sección',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    format: 'uuid',
  })
  restaurantId: string;

  @ApiProperty({ description: 'Nombre de la sección' })
  name: string;

  @ApiProperty({
    description: 'Descripción de la sección',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Ancho de la sección', example: 120 })
  width: number;

  @ApiProperty({ description: 'Alto de la sección', example: 80 })
  height: number;
}
