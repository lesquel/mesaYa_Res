import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class NearbyRestaurantsQueryDto {
  @ApiProperty({ description: 'Latitud del usuario', example: -0.18065 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ description: 'Longitud del usuario', example: -78.46783 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Radio máximo en kilómetros (por defecto 5km)',
    example: 5,
    minimum: 0.5,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(100)
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de resultados (por defecto 10)',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export interface ListNearbyRestaurantsQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
}
