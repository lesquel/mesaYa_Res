import { ApiProperty } from '@nestjs/swagger';
import type { AuthUserInfo } from '../../application/dto/responses/auth-token.response';

/** User data returned from Auth MS via Kafka */
interface AuthProxyUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

/** JWT claims structure from validated token */
interface JwtUserClaims {
  userId: string;
  email: string;
  roles: Array<{ name: string; permissions?: Array<{ name: string }> }>;
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

  /** Create DTO from AuthUserInfo (from AuthService) */
  static fromDomain(user: AuthUserInfo): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = user.id ?? '';
    dto.email = user.email;
    dto.name = user.name;
    dto.phone = ''; // Phone not included in basic user info
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

  /** Create DTO directly from JWT claims - no DB lookup needed */
  static fromJwtClaims(claims: JwtUserClaims): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = claims.userId;
    dto.email = claims.email;
    dto.name = ''; // Name not in JWT claims, frontend can fetch if needed
    dto.phone = '';
    dto.roles = claims.roles.map((role) => role.name);
    return dto;
  }
}
