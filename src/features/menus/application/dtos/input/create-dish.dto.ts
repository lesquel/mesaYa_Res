import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ example: 'abc123-uuid-restaurant' })
  @IsString()
  restaurantId: string;
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'abc123-uuid-image' })
  @IsOptional()
  @IsString()
  imageId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiPropertyOptional({ format: 'uuid', example: 'abc123-uuid-category' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  categoryDescription?: string | null;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  categoryOrder?: number;
}
