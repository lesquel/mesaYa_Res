import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Utilidad para recortar strings entrantes
const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  nombre: string;

  @IsOptional()
  @IsString()
  @trim()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @trim()
  ubicacion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  horariosAtencion: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacidadTotal: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  suscripcionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  imagenId?: number;
}
