import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateMenuDto } from '../../application/dtos/input/create-menu.dto.js';
import { CreateDishRequestDto } from './create-dish.request.dto.js';

export class CreateMenuRequestDto implements CreateMenuDto {
  @ApiProperty({ description: 'Identificador del restaurante', example: 1001 })
  @IsInt()
  @IsPositive()
  restaurantId: number;

  @ApiProperty({ description: 'Nombre del menú', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del menú' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Precio del menú', example: 25.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'URL de la imagen representativa' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Platos asociados al menú',
    type: () => CreateDishRequestDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDishRequestDto)
  dishes?: CreateDishRequestDto[];
}
