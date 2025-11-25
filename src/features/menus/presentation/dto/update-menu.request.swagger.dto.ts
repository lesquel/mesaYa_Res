import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { UpdateMenuDto } from '../../application/dtos/input/update-menu.dto';
import { UpdateDishRequestDto } from './update-dish.request.swagger.dto';

export class UpdateMenuRequestDto implements Omit<UpdateMenuDto, 'menuId'> {
  @ApiPropertyOptional({ description: 'Nombre del menú', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del menú' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Precio del menú', example: 20.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'UUID de la imagen subida',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  imageId?: string | null;

  @ApiPropertyOptional({
    description: 'Platos asociados al menú',
    type: () => UpdateDishRequestDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDishRequestDto)
  dishes?: UpdateDishRequestDto[];
}
