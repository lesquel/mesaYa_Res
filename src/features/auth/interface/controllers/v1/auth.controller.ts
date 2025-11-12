import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
  ApiQuery,
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
import { UpdateUserRolesRequestDto } from '../../dto/update-user-roles.request.dto';
import { UpdateRolePermissionsRequestDto } from '../../dto/update-role-permissions.request.dto';
import { AuthUserResponseDto } from '../../dto/auth-user.response.dto';
import { RoleResponseDto } from '../../dto/role.response.dto';
import { PermissionResponseDto } from '../../dto/permission.response.dto';
import { SignUpCommand } from '@features/auth/application/dto/commands/sign-up.command';
import { LoginCommand } from '@features/auth/application/dto/commands/login.command';
import { UpdateUserRolesCommand } from '@features/auth/application/dto/commands/update-user-roles.command';
import { UpdateRolePermissionsCommand } from '@features/auth/application/dto/commands/update-role-permissions.command';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { AuthAnalyticsRequestDto } from '../../dto/auth-analytics.request.dto';
import { AuthAnalyticsResponseDto } from '../../dto/auth-analytics.response.dto';
import { ThrottleAuth, ThrottleRead } from '@shared/infrastructure/decorators';
import { ListUsersUseCase } from '@features/auth/application/use-cases/list-users.use-case';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { AdminAuthUserResponseDto } from '../../dto/admin-auth-user.response.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

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
    description: 'Usuario autenticado',
    type: AuthUserResponseDto,
  })
  async me(
    @CurrentUser() currentUser: { userId: string },
  ): Promise<AuthUserResponseDto> {
    const user = await this.authService.getCurrentUser(currentUser.userId);
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

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Indicadores analíticos de usuarios (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Datos agregados para dashboards de autenticación',
    type: AuthAnalyticsResponseDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha final (ISO 8601)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filtra por nombre de rol',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtra por estado del usuario (true/false)',
  })
  async getAnalytics(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: AuthAnalyticsRequestDto,
  ): Promise<AuthAnalyticsResponseDto> {
    const analytics = await this.authService.getAnalytics(query.toQuery());
    return AuthAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios (ADMIN) — incluye roles y estado' })
  @ApiBearerAuth()
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: AdminAuthUserResponseDto,
    description: 'Listado paginado de usuarios (admin view)',
  })
  async listUsersAdmin(
    @PaginationParams({ defaultRoute: '/auth/admin/users' })
    params: PaginatedQueryParams,
  ) {
    const query = { ...params } as any;
    const paginated = await this.listUsersUseCase.execute(query);
    return {
      ...paginated,
      results: paginated.results.map((u) => AdminAuthUserResponseDto.fromDomain(u)),
    };
  }

  @Patch('admin/users/:id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Cambiar roles de un usuario (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserRolesRequestDto })
  @ApiOkResponse({
    description: 'Roles del usuario actualizados',
    type: AuthUserResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  async updateUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true }))
    dto: UpdateUserRolesRequestDto,
  ): Promise<AuthUserResponseDto> {
    const user = await this.authService.updateUserRoles(
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
  @ApiOkResponse({
    description: 'Permisos del rol actualizados',
    type: RoleResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  async updateRolePermissions(
    @Param('name') name: string,
    @Body(new ValidationPipe({ whitelist: true }))
    dto: UpdateRolePermissionsRequestDto,
  ): Promise<RoleResponseDto> {
    const role = await this.authService.updateRolePermissions(
      new UpdateRolePermissionsCommand(name, dto.permissions),
    );

    return RoleResponseDto.fromDomain(role);
  }

  @Get('admin/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar roles (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Listado de roles con permisos',
    type: [RoleResponseDto],
  })
  async listRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.authService.listRoles();
    return roles.map((role) => RoleResponseDto.fromDomain(role));
  }

  @Get('admin/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.ADMIN)
  @ApiOperation({ summary: 'Listar permisos (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Listado de permisos',
    type: [PermissionResponseDto],
  })
  async listPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.authService.listPermissions();
    return permissions.map((permission) =>
      PermissionResponseDto.fromDomain(permission),
    );
  }
}
