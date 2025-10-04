import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[]; // nombres de permisos, p. ej., ['restaurant:create']
}
