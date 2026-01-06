import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { AuthService } from '../../../application/services/auth.service';
import { SignUpRequestDto } from '../../dto/sign-up.request.dto';
import { AuthTokenResponseDto } from '../../dto/auth-token.response.dto';
import { LoginRequestDto } from '../../dto/login.request.dto';
import { AuthUserResponseDto } from '../../dto/auth-user.response.dto';
import { SignUpCommand } from '@features/auth/application/dto/commands/sign-up.command';
import { LoginCommand } from '@features/auth/application/dto/commands/login.command';
import { AuthRoleName } from '@features/auth/domain/enums';
import { ThrottleAuth, ThrottleRead } from '@shared/infrastructure/decorators';

/**
 * Simplified Auth Controller.
 *
 * Handles only core authentication endpoints.
 * All operations delegate to Auth MS via AuthService/AuthProxyService.
 *
 * User management (list, update roles, etc.) should be done directly
 * via Auth MS or moved to a separate admin service.
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
  async signup(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: SignUpRequestDto,
  ): Promise<AuthTokenResponseDto> {
    const response = await this.authService.signup(
      new SignUpCommand(dto.email, dto.password, dto.name, dto.phone),
    );

    return AuthTokenResponseDto.fromApplication(response);
  }

  @Post('login')
  @ThrottleAuth()
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({
    description: 'Inicio de sesión correcto',
    type: AuthTokenResponseDto,
  })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: LoginRequestDto,
  ): Promise<AuthTokenResponseDto> {
    const response = await this.authService.login(
      new LoginCommand(dto.email, dto.password),
    );
    return AuthTokenResponseDto.fromApplication(response);
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
  me(
    @CurrentUser() currentUser: { userId: string; email: string; roles: any[] },
  ): AuthUserResponseDto {
    // Return user info directly from JWT claims - no DB lookup needed
    return AuthUserResponseDto.fromJwtClaims(currentUser);
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
  async logout(
    @CurrentUser() currentUser: { userId: string },
  ): Promise<{ message: string }> {
    await this.authService.logout(currentUser.userId);
    return { message: 'Logged out successfully' };
  }
}
