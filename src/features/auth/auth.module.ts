import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

import { AuthController } from './interface/controllers/v1/auth.controller';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { RolesGuard } from './interface/guards/roles.guard';
import { PermissionsGuard } from './interface/guards/permissions.guard';
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
import { AuthService } from './application/services/auth.service';
import {
  AuthProxyService,
  AUTH_KAFKA_CLIENT,
} from './infrastructure/messaging/auth-proxy.service';

/**
 * Simplified Auth Module.
 *
 * ARCHITECTURE: Users live exclusively in Auth MS.
 * This module only handles:
 * - JWT validation (RS256 with public key)
 * - Guards (read roles/permissions from JWT claims)
 * - Proxy to Auth MS for signup/login/refresh/logout
 *
 * NO local user storage. NO database entities.
 * All user data comes from Auth MS via Kafka or JWT claims.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT Module uses RS256 with public key for validation only
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
              brokers: (
                config.get<string>('KAFKA_BROKER') || 'localhost:29092'
              ).split(','),
              connectionTimeout: 10000,
              retry: {
                initialRetryTime: 1000,
                retries: 10,
              },
            },
            consumer: {
              groupId: 'mesaya-gateway-auth-group',
              retry: {
                initialRetryTime: 1000,
                retries: 10,
              },
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
              allowAutoTopicCreation: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    // Proxy for communication with Auth MS
    AuthProxyService,
    // Service that uses the proxy
    AuthService,
    // JWT strategy for token validation with public key (RS256)
    JwtStrategy,
    // Guards for protecting endpoints (read from JWT claims)
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
    AuthService,
    AuthProxyService,
  ],
})
export class AuthModule {}
