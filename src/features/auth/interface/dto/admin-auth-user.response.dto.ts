import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from '../../domain/entities/auth-user.entity';

export class AdminAuthUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ description: 'Active status' })
  active!: boolean;

  @ApiProperty({ type: [String] })
  roles!: string[];

  static fromDomain(user: AuthUser): AdminAuthUserResponseDto {
    const dto = new AdminAuthUserResponseDto();
    dto.id = user.id ?? '';
    dto.email = user.email;
    dto.name = user.name;
    dto.phone = user.phone;
    dto.active = user.active;
    dto.roles = user.roles.map((r) => r.name);
    return dto;
  }
}
