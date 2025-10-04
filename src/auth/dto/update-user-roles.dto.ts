import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[]; // nombres de roles, p. ej., ['ADMIN', 'OWNER']
}
