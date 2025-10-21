import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateImageDto {
  @ApiPropertyOptional({ example: 'https://cdn.mesaya.com/assets/banner.jpg' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

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
};
