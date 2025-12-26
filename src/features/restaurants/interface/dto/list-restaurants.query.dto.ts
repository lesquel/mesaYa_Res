import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Query DTO for filtering restaurants with specific fields.
 * These filters complement the generic pagination params.
 */
export class ListRestaurantsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by restaurant name (partial match)',
    example: 'Pizza Palace',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by city/location',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by cuisine type',
    example: 'italian',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cuisineType?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;
}
