import type { Buffer } from 'node:buffer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: 'Banner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  title: string;

  @ApiProperty({ example: 'Main banner for the landing section' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  entityId: string;
}

export interface ImageFilePayload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export type CreateImageCommand = CreateImageDto & {
  file: ImageFilePayload;
};
