import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from '../../domain/entities/auth-user.entity';

/** User data returned from Auth MS via Kafka */
interface AuthProxyUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

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

  /** Create DTO from Auth MS proxy response data */
  static fromProxyData(data: AuthProxyUserData): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = data.id;
    dto.email = data.email;
    dto.name = `${data.firstName} ${data.lastName}`.trim();
    dto.phone = ''; // Phone not returned from Auth MS in user queries
    dto.roles = data.roles;
    return dto;
  }
}
