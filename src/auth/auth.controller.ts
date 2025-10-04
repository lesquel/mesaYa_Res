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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rbac: RbacService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return req.user;
  }

  @Get('admin/check')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  adminCheck() {
    return { ok: true };
  }

  // Admin: cambiar roles de un usuario
  @Patch('admin/users/:id/roles')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
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
  listRoles() {
    return this.rbac.listRoles();
  }

  // Admin: listar permisos
  @Get('admin/permissions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  listPermissions() {
    return this.rbac.listPermissions();
  }
}
