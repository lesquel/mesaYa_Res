import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class PaginationDto {
  // Página basada en 1 (si no se envía, usa 1 cuando no se envía offset)
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Página (1-based)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? undefined : value,
  )
  page?: number;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    description: 'Desplazamiento',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  offset?: number;

  // Límite con valores por defecto/techo
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? 10 : value,
  )
  limit?: number;

  // Ordenación segura (se validará contra columnas permitidas en el helper)
  @ApiPropertyOptional({
    example: 'name',
    description: 'Campo por el cual ordenar',
  })
  @IsOptional()
  @IsString()
  // solo letras, números y guiones bajos para prevenir inyección
  @Matches(/^\w+$/)
  sortBy?: string;

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  sortOrder?: 'ASC' | 'DESC';

  // Búsqueda libre (el helper aplica ILIKE %q% en columnas configuradas)
  @ApiPropertyOptional({ example: 'pizza', description: 'Texto de búsqueda' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q?: string;
}
