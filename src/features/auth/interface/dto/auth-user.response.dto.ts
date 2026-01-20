import { ApiProperty } from '@nestjs/swagger';
import { CurrentUserVo } from '../../domain/value-objects/current-user.value-object';
import { AuthUserOutput } from '../../application/dto/outputs/auth-user.output';

/** User data returned from Auth MS via Kafka */
interface AuthProxyUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

/**
 * @deprecated Use CurrentUserVo instead
 */
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

  /** Create DTO from AuthUserOutput (from AuthService) */
  static fromApplication(output: AuthUserOutput): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = output.id;
    dto.email = output.email;
    dto.name = output.name;
    dto.phone = '';
    dto.roles = output.roles.map((role) => role.name);
    return dto;
  }

  /** Create DTO from CurrentUserVo - extracted from JWT */
  static fromCurrentUser(user: CurrentUserVo): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = user.userId;
    dto.email = user.email;
    dto.name = user.fullName;
    dto.phone = '';
    dto.roles = user.roles.map((role) => role.name);
    return dto;
  }

  /** Create DTO from Auth MS proxy response data */
  static fromProxyData(data: AuthProxyUserData): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = data.id;
    dto.email = data.email;
    dto.name = `${data.firstName} ${data.lastName}`.trim();
    dto.phone = '';
    dto.roles = data.roles;
    return dto;
  }

  /**
   * @deprecated Use fromCurrentUser(user: CurrentUserVo) instead
   */
  static fromJwtClaims(claims: JwtUserClaims): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = claims.userId;
    dto.email = claims.email;
    dto.name = '';
    dto.phone = '';
    dto.roles = claims.roles.map((role) => role.name);
    return dto;
  }

  /**
   * @deprecated Use fromApplication instead
   */
  static fromDomain(user: {
    id?: string;
    email: string;
    name: string;
    roles: Array<{ name: string }>;
  }): AuthUserResponseDto {
    const dto = new AuthUserResponseDto();
    dto.id = user.id ?? '';
    dto.email = user.email;
    dto.name = user.name;
    dto.phone = '';
    dto.roles = user.roles.map((role) => role.name);
    return dto;
  }
}
