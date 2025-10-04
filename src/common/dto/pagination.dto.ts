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
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? undefined : value,
  )
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  offset?: number;

  // Límite con valores por defecto/techo
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
  @IsOptional()
  @IsString()
  // solo letras, números y guiones bajos para prevenir inyección
  @Matches(/^\w+$/)
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  sortOrder?: 'ASC' | 'DESC';

  // Búsqueda libre (el helper aplica ILIKE %q% en columnas configuradas)
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q?: string;
}
