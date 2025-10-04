import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateUserRolesDto {
  @ApiProperty({
    type: [String],
    example: ['ADMIN', 'OWNER'],
    description: 'Nombres de roles a asignar al usuario',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[]; // nombres de roles, p. ej., ['ADMIN', 'OWNER']
}
