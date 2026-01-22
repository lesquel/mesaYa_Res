import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

// Controllers
import { AuthController } from './interface/controllers/v1/auth.controller';

// Application
import { AuthService } from './application/services/auth.service';
import { AUTH_PROVIDER } from './application/ports/auth-provider.port';

// Infrastructure
import {
  KafkaAuthProvider,
  AUTH_KAFKA_CLIENT,
} from './infrastructure/messaging/kafka-auth.provider';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';

// Interface
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
import { RolesGuard } from './interface/guards/roles.guard';
import { PermissionsGuard } from './interface/guards/permissions.guard';

/**
 * Auth Module (Refactorizado).
 *
 * Arquitectura:
 * - Ports & Adapters: AuthProvider puerto, KafkaAuthProvider adapter
 * - Hexagonal: Separación clara entre capas
 * - DI: Tokens para inyección de dependencias
 *
 * ARCHITECTURE: Users live exclusively in Auth MS.
 * This module only handles:
 * - JWT validation (RS256 with public key)
 * - Guards (read roles/permissions from JWT claims)
 * - Proxy to Auth MS for signup/login/refresh/logout
 *
 * NO local user storage. NO database entities.
 * All user data comes from Auth MS via Kafka or JWT claims.
 *
 * Exports públicos:
 * - Guards: JwtAuthGuard, RolesGuard, PermissionsGuard
 * - Decoradores: @CurrentUser, @Roles, @Permissions (vía index.ts)
 * - Enums: AuthRoleName (vía index.ts)
 * - Módulo para importación
 *
 * NO expone:
 * - KafkaAuthProvider (es adapter interno)
 * - Tipos de Kafka
 * - Detalles de implementación
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
              // Use 127.0.0.1 instead of localhost to force IPv4 (IPv6 has issues with Docker WSL2)
              brokers: (
                config.get<string>('KAFKA_BROKER') || '127.0.0.1:29092'
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
    // Adapter Kafka que implementa IAuthProvider
    KafkaAuthProvider,
    // Puerto (token) apunta a adapter
    {
      provide: AUTH_PROVIDER,
      useExisting: KafkaAuthProvider,
    },
    // Servicio de aplicación
    AuthService,
    // Estrategia JWT para validación de token con clave pública (RS256)
    JwtStrategy,
    // Guards para proteger endpoints (leen del JWT claims)
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    // Módulos de Passport/JWT para uso en otros módulos
    PassportModule,
    JwtModule,
    // Guards públicos
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    // AuthService para casos que lo necesiten
    AuthService,
    // Puerto para inyección en otros módulos
    AUTH_PROVIDER,
  ],
})
export class AuthModule {}
