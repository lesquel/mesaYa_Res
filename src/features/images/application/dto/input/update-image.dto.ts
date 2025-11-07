import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { ImageFilePayload } from './create-image.dto.js';

export class UpdateImageDto {
  @ApiPropertyOptional({ example: 'Banner' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title?: string;

  @ApiPropertyOptional({ example: 'Main banner for the landing section' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  @IsUUID()
  entityId?: string;
}

export type UpdateImageCommand = UpdateImageDto & {
  imageId: string;
  file?: ImageFilePayload;
};
