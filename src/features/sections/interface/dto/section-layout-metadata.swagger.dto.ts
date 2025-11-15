import { ApiProperty } from '@nestjs/swagger';
import type { SectionLayoutMetadata } from '@features/sections/domain/types';

export class SectionLayoutMetadataSwaggerDto implements SectionLayoutMetadata {
  @ApiProperty({
    description: 'Identificador del layout asociado',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  layoutId?: string | null;

  @ApiProperty({
    description: 'Orientación de la sección dentro del layout',
    example: 'LANDSCAPE',
    required: false,
    enum: ['LANDSCAPE', 'PORTRAIT'],
  })
  orientation?: 'LANDSCAPE' | 'PORTRAIT';

  @ApiProperty({
    description: 'Nivel de apilamiento para renderizado',
    example: 0,
    required: false,
  })
  zIndex?: number;

  @ApiProperty({
    description: 'Notas adicionales sobre el layout',
    required: false,
    nullable: true,
  })
  notes?: string | null;
}
