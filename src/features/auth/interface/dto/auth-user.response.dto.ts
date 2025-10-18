import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from '../../domain/entities/auth-user.entity.js';

export class AuthUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  static fromDomain(user: AuthUser): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = user.id ?? '';
    dto.email = user.email;
    dto.name = user.name;
    dto.phone = user.phone;
    dto.roles = user.roles.map((role) => role.name);
    return dto;
  }
}
