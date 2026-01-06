import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthTokenResponse } from '../../application/dto/responses/auth-token.response';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthTokenResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty({ description: 'Access token for authorization' })
  accessToken: string;

  @ApiPropertyOptional({ description: 'Refresh token for token renewal' })
  refreshToken?: string;

  /** @deprecated Use accessToken instead */
  @ApiPropertyOptional({ deprecated: true })
  token?: string;

  static fromApplication(response: AuthTokenResponse): AuthTokenResponseDto {
    const dto = new AuthTokenResponseDto();
    dto.user = AuthUserResponseDto.fromDomain(response.user);
    // Support both old (token) and new (accessToken) formats
    dto.accessToken = response.accessToken || response.token || '';
    dto.refreshToken = response.refreshToken;
    dto.token = response.token || response.accessToken;
    return dto;
  }
}
