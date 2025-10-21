import { ApiProperty } from '@nestjs/swagger';
import { AuthPermission } from '../../domain/entities/auth-permission.entity';

export class PermissionResponseDto {
  @ApiProperty()
  name: string;

  static fromDomain(permission: AuthPermission): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.name = permission.name;
    return dto;
  }
}
