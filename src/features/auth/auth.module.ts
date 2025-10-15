import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './interface/controllers/auth.controller.js';
import { UserOrmEntity } from './infrastructure/database/typeorm/entities/user.orm-entity.js';
import { RoleOrmEntity } from './infrastructure/database/typeorm/entities/role.orm-entity.js';
import { PermissionOrmEntity } from './infrastructure/database/typeorm/entities/permission.orm-entity.js';
import { AuthUserTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-user-typeorm.repository.js';
import { AuthRoleTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-role-typeorm.repository.js';
import { AuthPermissionTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-permission-typeorm.repository.js';
import { AUTH_USER_REPOSITORY } from './application/ports/user.repository.port.js';
import { AUTH_ROLE_REPOSITORY } from './application/ports/role.repository.port.js';
import { AUTH_PERMISSION_REPOSITORY } from './application/ports/permission.repository.port.js';
import { AUTH_PASSWORD_HASHER } from './application/ports/password-hasher.port.js';
import { AUTH_TOKEN_SERVICE } from './application/ports/token.service.port.js';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter.js';
import { JwtTokenServiceAdapter } from './infrastructure/security/jwt-token-service.adapter.js';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { UpdateUserRolesUseCase } from './application/use-cases/update-user-roles.use-case.js';
import { UpdateRolePermissionsUseCase } from './application/use-cases/update-role-permissions.use-case.js';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case.js';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case.js';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case.js';
import { JwtStrategy } from './infrastructure/security/jwt.strategy.js';
import { RbacSeeder } from './infrastructure/seeding/rbac.seeder.js';
import { RolesGuard } from './interface/guards/roles.guard.js';
import { PermissionsGuard } from './interface/guards/permissions.guard.js';
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity, PermissionOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_USER_REPOSITORY,
      useClass: AuthUserTypeOrmRepository,
    },
    {
      provide: AUTH_ROLE_REPOSITORY,
      useClass: AuthRoleTypeOrmRepository,
    },
    {
      provide: AUTH_PERMISSION_REPOSITORY,
      useClass: AuthPermissionTypeOrmRepository,
    },
    {
      provide: AUTH_PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter,
    },
    SignUpUseCase,
    LoginUseCase,
    UpdateUserRolesUseCase,
    UpdateRolePermissionsUseCase,
    ListRolesUseCase,
    ListPermissionsUseCase,
    FindUserByIdUseCase,
    JwtStrategy,
    RbacSeeder,
    RolesGuard,
    PermissionsGuard,
    JwtAuthGuard,
  ],
  exports: [
    PassportModule,
    JwtModule,
    RolesGuard,
    PermissionsGuard,
    JwtAuthGuard,
    AUTH_USER_REPOSITORY,
    AUTH_ROLE_REPOSITORY,
    AUTH_PERMISSION_REPOSITORY,
  ],
})
export class AuthModule {}
