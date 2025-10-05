import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RbacService } from './rbac/rbac.service.js';
import {
  SignUpDto,
  LoginDto,
  UpdateUserRolesDto,
  UpdateRolePermissionsDto,
} from './dto/index.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorator/roles.decorator.js';
import { RolesGuard } from './guard/roles.guard.js';
import { UserRole } from './entities/user.entity.js';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rbac: RbacService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({ type: SignUpDto })
  @ApiCreatedResponse({
    description: 'Usuario registrado correctamente',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Inicio de sesión correcto',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
        token: { type: 'string' },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Usuario autenticado',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        email: { type: 'string' },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              permissions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  })
  me(@Req() req: any) {
    return req.user;
  }

  @Get('admin/check')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verifica que el usuario sea ADMIN' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Usuario con rol ADMIN' })
  adminCheck() {
    return { ok: true };
  }

  // Admin: cambiar roles de un usuario
  @Patch('admin/users/:id/roles')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar roles de un usuario (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserRolesDto })
  @ApiOkResponse({ description: 'Roles del usuario actualizados' })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  updateUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.rbac.updateUserRoles(id, dto.roles);
  }

  // Admin: cambiar permisos de un rol
  @Patch('admin/roles/:name/permissions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar permisos de un rol (ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'name', description: 'Nombre del rol' })
  @ApiBody({ type: UpdateRolePermissionsDto })
  @ApiOkResponse({ description: 'Permisos del rol actualizados' })
  @ApiForbiddenResponse({ description: 'Requiere rol ADMIN' })
  updateRolePermissions(
    @Param('name') name: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbac.updateRolePermissions(name, dto.permissions);
  }

  // Admin: listar roles
  @Get('admin/roles')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar roles (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Listado de roles con permisos' })
  listRoles() {
    return this.rbac.listRoles();
  }

  // Admin: listar permisos
  @Get('admin/permissions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar permisos (ADMIN)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Listado de permisos' })
  listPermissions() {
    return this.rbac.listPermissions();
  }
}
