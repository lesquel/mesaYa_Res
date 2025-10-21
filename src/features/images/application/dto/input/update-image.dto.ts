import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  entityId?: number;
}

export type UpdateImageCommand = UpdateImageDto & {
  imageId: number;
  file?: ImageFilePayload;
};
