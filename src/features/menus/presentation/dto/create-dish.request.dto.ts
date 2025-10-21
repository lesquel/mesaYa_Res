import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { CreateDishDto } from '../../application/dtos/input/create-dish.dto';

export class CreateDishRequestDto implements CreateDishDto {
  @ApiProperty({ description: 'Identificador del restaurante', example: 1001 })
  @IsInt()
  @IsPositive()
  restaurantId: number;

  @ApiProperty({ description: 'Nombre del plato', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del plato' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Precio del plato', example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Identificador de la imagen',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageId?: number;
}
