import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { AuthService } from '../../../application/services/auth.service';
import { SignUpRequestDto } from '../../dto/sign-up.request.dto';
import { AuthTokenResponseDto } from '../../dto/auth-token.response.dto';
import { LoginRequestDto } from '../../dto/login.request.dto';
import { RefreshTokenRequestDto } from '../../dto/refresh-token.request.dto';
import { AuthUserResponseDto } from '../../dto/auth-user.response.dto';
import { SignUpInput } from '../../../application/dto/inputs/sign-up.input';
import { LoginInput } from '../../../application/dto/inputs/login.input';
import { AuthRoleName } from '../../../domain/enums';
import { AuthDomainError } from '../../../domain/errors';
import { CurrentUserVo } from '../../../domain/value-objects/current-user.value-object';
import { ThrottleAuth, ThrottleRead } from '@shared/infrastructure/decorators';

/**
 * Auth Controller (v1).
 *
 * Responsabilidades:
 * - Validar entrada HTTP
 * - Convertir DTOs a inputs de aplicación
 * - Llamar a AuthService
 * - Mapear salida a DTOs HTTP
 * - Traducir errores de dominio a HTTP
 *
 * NO contiene lógica de negocio.
 */
@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ThrottleAuth()
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiCreatedResponse({
    description: 'Usuario registrado correctamente',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Email ya registrado o datos inválidos' })
  async signup(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: SignUpRequestDto,
  ): Promise<AuthTokenResponseDto> {
    try {
      const input = new SignUpInput(dto.email, dto.password, dto.name, dto.phone);
      const output = await this.authService.signup(input);
      return AuthTokenResponseDto.fromApplication(output);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  @Post('login')
  @ThrottleAuth()
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({
    description: 'Inicio de sesión correcto',
    type: AuthTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: LoginRequestDto,
  ): Promise<AuthTokenResponseDto> {
    try {
      const input = new LoginInput(dto.email, dto.password);
      const output = await this.authService.login(input);
      return AuthTokenResponseDto.fromApplication(output);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  @Post('refresh')
  @ThrottleAuth()
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({
    description: 'Tokens renovados correctamente',
    type: AuthTokenResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido' })
  async refresh(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: RefreshTokenRequestDto,
  ): Promise<AuthTokenResponseDto> {
    try {
      const output = await this.authService.refreshToken(dto.refreshToken);
      return AuthTokenResponseDto.fromApplication(output);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  @Get('me')
  @ThrottleRead()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Datos del usuario desde el token JWT',
    type: AuthUserResponseDto,
  })
  me(@CurrentUser() user: CurrentUserVo): AuthUserResponseDto {
    return AuthUserResponseDto.fromCurrentUser(user);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Verifica que el usuario sea ADMIN' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Usuario con rol ADMIN' })
  adminCheck(): { ok: true } {
    return { ok: true };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Sesión cerrada correctamente' })
  async logout(@CurrentUser() user: CurrentUserVo): Promise<{ message: string }> {
    await this.authService.logout(user.userId);
    return { message: 'Logged out successfully' };
  }

  /**
   * Mapea errores de dominio a excepciones HTTP.
   */
  private handleAuthError(error: unknown): Error {
    if (error instanceof AuthDomainError) {
      switch (error.statusCode) {
        case 401:
          return new UnauthorizedException(error.message);
        case 503:
          return new ServiceUnavailableException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    return new BadRequestException('Unknown authentication error');
  }
}
