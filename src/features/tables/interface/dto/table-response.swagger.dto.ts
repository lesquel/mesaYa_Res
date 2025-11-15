import { ApiProperty } from '@nestjs/swagger';
import type { TableResponseDto } from '@features/tables/application/dto/output/table.response.dto';

export class TableResponseSwaggerDto implements TableResponseDto {
  @ApiProperty({
    description: 'Identificador de la mesa',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador de la sección a la que pertenece',
    format: 'uuid',
  })
  sectionId: string;

  @ApiProperty({ description: 'Número visible de la mesa' })
  number: number;

  @ApiProperty({ description: 'Capacidad máxima de la mesa' })
  capacity: number;

  @ApiProperty({ description: 'Posición horizontal (X)', example: 60 })
  posX: number;

  @ApiProperty({ description: 'Posición vertical (Y)', example: 40 })
  posY: number;

  @ApiProperty({ description: 'Ancho total de la mesa', example: 90 })
  width: number;

  @ApiProperty({ description: 'Altura total de la mesa', example: 90 })
  height: number;

  @ApiProperty({
    description: 'Identificador de la imagen de la mesa',
    format: 'uuid',
  })
  tableImageId: string;

  @ApiProperty({
    description: 'Identificador de la imagen de la silla',
    format: 'uuid',
  })
  chairImageId: string;

  @ApiProperty({
    description: 'Estado actual de la mesa',
    enum: ['AVAILABLE', 'OCCUPIED', 'BLOCKED'],
    example: 'AVAILABLE',
  })
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';

  @ApiProperty({
    description: 'Flag que indica si la mesa está disponible para reservar',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la mesa',
    type: Date,
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la mesa',
    type: Date,
    example: '2025-01-20T14:45:00Z',
  })
  updatedAt: Date;
}
