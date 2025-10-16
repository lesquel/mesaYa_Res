import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from '../../domain/entities/auth-role.entity.js';

export class RoleResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  permissions: string[];

  static fromDomain(role: AuthRole): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.name = role.name;
    dto.permissions = role.permissions.map((permission) => permission.name);
    return dto;
  }
}
