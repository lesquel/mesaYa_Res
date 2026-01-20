import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthTokenOutput } from '../../application/dto/outputs/auth-token.output';
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

  static fromApplication(output: AuthTokenOutput): AuthTokenResponseDto {
    const dto = new AuthTokenResponseDto();
    dto.user = AuthUserResponseDto.fromApplication(output.user);
    dto.accessToken = output.accessToken;
    dto.refreshToken = output.refreshToken;
    dto.token = output.accessToken; // Backwards compatibility
    return dto;
  }
}
