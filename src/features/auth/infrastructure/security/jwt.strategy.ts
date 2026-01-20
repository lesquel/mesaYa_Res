import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';
import { JwtPayloadMapper } from './jwt-payload.mapper';
import { CurrentUserVo } from '../../domain/value-objects/current-user.value-object';

/**
 * JWT Strategy using RS256 asymmetric validation.
 *
 * This strategy validates JWTs signed by the Auth Microservice using
 * only the public key. No database lookup is required for validation -
 * we trust the claims in the JWT.
 *
 * The Auth MS signs tokens with the private key, and the Gateway
 * validates them locally with the public key.
 *
 * Returns a CurrentUserVo (Value Object) that guarantees valid data.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    const publicKey = configService
      .get<string>('JWT_PUBLIC_KEY')
      ?.replace(/\\n/g, '\n');

    if (!publicKey) {
      throw new Error('JWT_PUBLIC_KEY is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      issuer: 'mesaYA-auth',
    });

    this.logger.debug('JWT Strategy initialized with RS256 validation');
  }

  /**
   * Validate the JWT payload and map to CurrentUserVo.
   *
   * Since we use RS256, if the token signature is valid and not expired,
   * we trust the claims in the token. No DB lookup needed.
   *
   * @throws Error if JWT payload structure is invalid.
   */
  async validate(payload: unknown): Promise<CurrentUserVo> {
    // Validate payload structure using Entity
    const entity = JwtPayloadEntity.validate(payload);
    this.logger.debug(`JWT validated for user: ${entity.sub}`);

    // Map to domain Value Object
    return JwtPayloadMapper.toDomain(entity);
  }
}
