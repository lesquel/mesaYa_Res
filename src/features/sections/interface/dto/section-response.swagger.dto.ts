import { ApiProperty } from '@nestjs/swagger';
import type { SectionResponseDto } from '../../application/dto/output/section.response.dto';
import { SectionLayoutMetadataSwaggerDto } from './section-layout-metadata.swagger.dto';

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

  @ApiProperty({ description: 'Coordenada X de la sección', example: 20 })
  posX: number;

  @ApiProperty({ description: 'Coordenada Y de la sección', example: 40 })
  posY: number;

  @ApiProperty({
    description: 'Estado de disponibilidad de la sección',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
  })
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

  @ApiProperty({ description: 'Ancho de la sección', example: 120 })
  width: number;

  @ApiProperty({ description: 'Alto de la sección', example: 80 })
  height: number;

  @ApiProperty({
    description: 'Metadatos de layout que ayudan a posicionar la sección',
    type: () => SectionLayoutMetadataSwaggerDto,
  })
  layoutMetadata: SectionLayoutMetadataSwaggerDto;

  @ApiProperty({
    description: 'Fecha de creación de la sección',
    type: Date,
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la sección',
    type: Date,
    example: '2025-01-20T14:45:00Z',
  })
  updatedAt: Date;
}
