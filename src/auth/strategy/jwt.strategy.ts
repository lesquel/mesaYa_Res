import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[]; // string names of roles for quick checks if needed
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Cargamos el usuario para adjuntar roles con permisos (ManyToMany eager)
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      return { userId: payload.sub, email: payload.email, roles: [] };
    }
    return {
      userId: user.id,
      email: user.email,
      roles: user.roles, // array de Role con permissions eager
    };
  }
}
