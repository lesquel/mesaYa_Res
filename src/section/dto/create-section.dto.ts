import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateSectionDto {
  @IsUUID()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @trim()
  name: string;

  @IsOptional()
  @IsString()
  @trim()
  description?: string;
}
