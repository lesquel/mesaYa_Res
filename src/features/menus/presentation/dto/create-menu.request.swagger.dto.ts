import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateMenuDto } from '../../application/dtos/input/create-menu.dto';
import { CreateDishRequestDto } from './create-dish.request.swagger.dto';

export class CreateMenuRequestDto implements CreateMenuDto {
  @ApiProperty({
    description: 'Identificador del restaurante',
    example: '1001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

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
    type: () => CreateDishRequestDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDishRequestDto)
  dishes?: CreateDishRequestDto[];
}
