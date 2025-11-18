import { ApiProperty } from '@nestjs/swagger';
import type { GraphicObjectResponseDto } from '@features/objects/application/dto';

export class GraphicObjectResponseSwaggerDto
  implements GraphicObjectResponseDto
{
  @ApiProperty({
    description: 'Identificador único del objeto gráfico',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Posición horizontal en la cuadrícula',
    example: 10,
  })
  posX: number;

  @ApiProperty({
    description: 'Posición vertical en la cuadrícula',
    example: 20,
  })
  posY: number;

  @ApiProperty({
    description: 'Ancho del objeto en unidades relativas',
    example: 80,
  })
  width: number;

  @ApiProperty({
    description: 'Alto del objeto en unidades relativas',
    example: 40,
  })
  height: number;

  @ApiProperty({
    description: 'Identificador de la imagen asociada',
    format: 'uuid',
  })
  imageId: string;

  @ApiProperty({
    description: 'Fecha de creación',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última modificación',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
