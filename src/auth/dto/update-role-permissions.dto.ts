import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['restaurant:create', 'section:read'],
    description: 'Permisos en formato entidad:acción',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[]; // nombres de permisos, p. ej., ['restaurant:create']
}
