import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy.js';
import { RolesGuard } from './guard/roles.guard.js';
import { PermissionsGuard } from './guard/permissions.guard.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RbacSeeder } from './rbac/rbac.seeder.js';
import { RbacService } from './rbac/rbac.service.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    RbacSeeder,
    RbacService,
  ],
  exports: [
    JwtModule,
    PassportModule,
    RolesGuard,
    PermissionsGuard,
    RbacService,
  ],
})
export class AuthModule {}
