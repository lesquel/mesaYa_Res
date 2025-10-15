import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { SignUpUseCase } from '../../application/use-cases/sign-up.use-case.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { UpdateUserRolesUseCase } from '../../application/use-cases/update-user-roles.use-case.js';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/update-role-permissions.use-case.js';
import { ListRolesUseCase } from '../../application/use-cases/list-roles.use-case.js';
import { ListPermissionsUseCase } from '../../application/use-cases/list-permissions.use-case.js';
import { SignUpRequestDto } from '../dto/sign-up.request.dto.js';
import { AuthTokenResponseDto } from '../dto/auth-token.response.dto.js';
import { LoginRequestDto } from '../dto/login.request.dto.js';
import { UpdateUserRolesRequestDto } from '../dto/update-user-roles.request.dto.js';
import { UpdateRolePermissionsRequestDto } from '../dto/update-role-permissions.request.dto.js';
import { AuthUserResponseDto } from '../dto/auth-user.response.dto.js';
import { RoleResponseDto } from '../dto/role.response.dto.js';
import { PermissionResponseDto } from '../dto/permission.response.dto.js';
import { SignUpCommand } from '../../application/dto/commands/sign-up.command.js';
import { LoginCommand } from '../../application/dto/commands/login.command.js';
import { UpdateUserRolesCommand } from '../../application/dto/commands/update-user-roles.command.js';
import { UpdateRolePermissionsCommand } from '../../application/dto/commands/update-role-permissions.command.js';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case.js';
import { AuthRoleName } from '../../domain/entities/auth-role.entity.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
    private readonly updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @Post('signup')
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
    const response = await this.signUpUseCase.execute(
      new SignUpCommand(dto.email, dto.password, dto.name, dto.phone),
    );

    return AuthTokenResponseDto.fromApplication(response);
  }

  @Post('login')
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
    const response = await this.loginUseCase.execute(
      new LoginCommand(dto.email, dto.password),
    );
    return AuthTokenResponseDto.fromApplication(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Usuario autenticado', type: AuthUserResponseDto })
  async me(@CurrentUser() currentUser: { userId: string }): Promise<AuthUserResponseDto> {
    const user = await this.findUserByIdUseCase.execute(currentUser.userId);
    if (!user) {
      throw new UnauthorizedException('Authenticated user not found');
    }
    return AuthUserResponseDto.fromDomain(user);
  }

  @Get('admin/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Verifica que el usuario sea ADMIN' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Usuario con rol ADMIN' })
  adminCheck(): { ok: true } {
    return { ok: true };
  }

  @Patch('admin/users/:id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Cambiar roles de un usuario (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserRolesRequestDto })
  @ApiOkResponse({ description: 'Roles del usuario actualizados', type: AuthUserResponseDto })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  async updateUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserRolesRequestDto,
  ): Promise<AuthUserResponseDto> {
    const user = await this.updateUserRolesUseCase.execute(
      new UpdateUserRolesCommand(id, dto.roles),
    );

    return AuthUserResponseDto.fromDomain(user);
  }

  @Patch('admin/roles/:name/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Cambiar permisos de un rol (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'name', description: 'Nombre del rol' })
  @ApiBody({ type: UpdateRolePermissionsRequestDto })
  @ApiOkResponse({ description: 'Permisos del rol actualizados', type: RoleResponseDto })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  async updateRolePermissions(
    @Param('name') name: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateRolePermissionsRequestDto,
  ): Promise<RoleResponseDto> {
    const role = await this.updateRolePermissionsUseCase.execute(
      new UpdateRolePermissionsCommand(name, dto.permissions),
    );

    return RoleResponseDto.fromDomain(role);
  }

  @Get('admin/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar roles (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Listado de roles con permisos', type: [RoleResponseDto] })
  async listRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.listRolesUseCase.execute();
    return roles.map((role) => RoleResponseDto.fromDomain(role));
  }

  @Get('admin/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar permisos (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Listado de permisos', type: [PermissionResponseDto] })
  async listPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.listPermissionsUseCase.execute();
    return permissions.map((permission) =>
      PermissionResponseDto.fromDomain(permission),
    );
  }
}
