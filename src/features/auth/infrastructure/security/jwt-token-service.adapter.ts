import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { type AuthTokenServicePort } from '../../application/ports/token.service.port';

@Injectable()
export class JwtTokenServiceAdapter implements AuthTokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  sign(user: AuthUser): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
    return Promise.resolve(this.jwtService.sign(payload));
  }
}
