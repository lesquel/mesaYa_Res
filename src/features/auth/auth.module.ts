import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './interface/controllers/v1/auth.controller';
import { UsersController } from './interface/controllers/v1/users.controller';
import { UserOrmEntity } from './infrastructure/database/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/database/typeorm/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/database/typeorm/entities/permission.orm-entity';
import { AuthUserTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-user-typeorm.repository';
import { AuthRoleTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-role-typeorm.repository';
import { AuthPermissionTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-permission-typeorm.repository';
import {
  AUTH_USER_REPOSITORY,
  AUTH_ROLE_REPOSITORY,
  AUTH_PERMISSION_REPOSITORY,
  AUTH_PASSWORD_HASHER,
  AUTH_TOKEN_SERVICE,
  AUTH_ANALYTICS_REPOSITORY,
} from './auth.tokens';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtTokenServiceAdapter } from './infrastructure/security/jwt-token-service.adapter';
import { UpdateUserRolesUseCase } from './application/use-cases/update-user-roles.use-case';
import { UpdateRolePermissionsUseCase } from './application/use-cases/update-role-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { GetAuthAnalyticsUseCase } from './application/use-cases/get-auth-analytics.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { RolesGuard } from './interface/guards/roles.guard';
import { PermissionsGuard } from './interface/guards/permissions.guard';
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
import { AuthAnalyticsTypeOrmRepository } from './infrastructure/database/typeorm/repositories/auth-analytics-typeorm.repository';
import { AuthService } from './application/services/auth.service';
import {
  AuthProxyService,
  AUTH_KAFKA_CLIENT,
} from './infrastructure/messaging/auth-proxy.service';
import { UserSyncConsumer } from './infrastructure/messaging/user-sync.consumer';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT Module now uses RS256 with public key for validation only
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: config.get<string>('JWT_PUBLIC_KEY')?.replace(/\\n/g, '\n'),
        verifyOptions: {
          algorithms: ['RS256'],
          issuer: 'mesaYA-auth',
        },
      }),
    }),
    // Kafka client for communicating with Auth MS
    ClientsModule.registerAsync([
      {
        name: AUTH_KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'mesaya-gateway',
              brokers: (config.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
            },
            consumer: {
              groupId: 'mesaya-gateway-auth-group',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController, UsersController, UserSyncConsumer],
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
    // Auth proxy for communication with Auth MS
    AuthProxyService,
    // Use cases (only local ones remain)
    UpdateUserRolesUseCase,
    UpdateRolePermissionsUseCase,
    ListRolesUseCase,
    ListPermissionsUseCase,
    GetAuthAnalyticsUseCase,
    ListUsersUseCase,
    AuthService,
    JwtStrategy,
    // RbacSeeder removed - RBAC seeding now handled by Auth MS
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
    AUTH_PASSWORD_HASHER,
    AUTH_PERMISSION_REPOSITORY,
    AUTH_PASSWORD_HASHER,
    AuthService,
    AuthProxyService,
  ],
})
export class AuthModule {}
