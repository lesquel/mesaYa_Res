import { ApiProperty } from '@nestjs/swagger';
import { AuthTokenResponse } from '../../application/dto/responses/auth-token.response';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthTokenResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty()
  token: string;

  static fromApplication(response: AuthTokenResponse): AuthTokenResponseDto {
    const dto = new AuthTokenResponseDto();
    dto.user = AuthUserResponseDto.fromDomain(response.user);
    dto.token = response.token;
    return dto;
  }
}
