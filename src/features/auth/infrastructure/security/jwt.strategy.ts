import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
  iss?: string;
}

/**
 * JWT Strategy using RS256 asymmetric validation.
 *
 * This strategy validates JWTs signed by the Auth Microservice using
 * only the public key. No database lookup is required for validation -
 * we trust the claims in the JWT.
 *
 * The Auth MS signs tokens with the private key, and the Gateway
 * validates them locally with the public key.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    const publicKey = configService.get<string>('JWT_PUBLIC_KEY')?.replace(/\\n/g, '\n');

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
  }

  /**
   * Validate the JWT payload.
   *
   * Since we use RS256, if the token signature is valid and not expired,
   * we trust the claims in the token. No DB lookup needed.
   */
  async validate(payload: JwtPayload) {
    // Transform JWT payload to the format expected by guards/decorators
    return {
      userId: payload.sub,
      email: payload.email,
      roles: (payload.roles || []).map((roleName) => ({
        name: roleName,
        // For permissions, we either get them from the token or derive from role
        permissions: (payload.permissions || []).map((perm) => ({
          name: perm,
        })),
      })),
    };
  }
}
