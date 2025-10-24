import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './interface/controllers/v1/auth.controller';
import { UserOrmEntity } from './infrastructure/database/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/database/typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/database/typeorm/entities/permission.orm-entity';
import { AuthUserTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-user-typeorm.repository';
import { AuthRoleTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-role-typeorm.repository';
import { AuthPermissionTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-permission-typeorm.repository';
import { AUTH_USER_REPOSITORY } from './application/ports/user.repository.port';
import { AUTH_ROLE_REPOSITORY } from './application/ports/role.repository.port';
import { AUTH_PERMISSION_REPOSITORY } from './application/ports/permission.repository.port';
import { AUTH_PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { AUTH_TOKEN_SERVICE } from './application/ports/token.service.port';
import { AUTH_ANALYTICS_REPOSITORY } from './application/ports/auth-analytics.repository.port';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtTokenServiceAdapter } from './infrastructure/security/jwt-token-service.adapter';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { UpdateUserRolesUseCase } from './application/use-cases/update-user-roles.use-case';
import { UpdateRolePermissionsUseCase } from './application/use-cases/update-role-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { GetAuthAnalyticsUseCase } from './application/use-cases/get-auth-analytics.use-case';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { RbacSeeder } from './infrastructure/seeding/rbac.seeder';
import { RolesGuard } from './interface/guards/roles.guard';
import { PermissionsGuard } from './interface/guards/permissions.guard';
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
import { AuthAnalyticsTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-analytics-typeorm.repository';
import { AuthService } from './application/services/auth.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity,
    ]),
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
    {
      provide: AUTH_ANALYTICS_REPOSITORY,
      useClass: AuthAnalyticsTypeOrmRepository,
    },
    SignUpUseCase,
    LoginUseCase,
    UpdateUserRolesUseCase,
    UpdateRolePermissionsUseCase,
    ListRolesUseCase,
    ListPermissionsUseCase,
    FindUserByIdUseCase,
    GetAuthAnalyticsUseCase,
    AuthService,
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
    AuthService,
  ],
})
export class AuthModule {}
