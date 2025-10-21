import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.findUserByIdUseCase.execute(payload.sub);
    if (!user) {
      return { userId: payload.sub, email: payload.email, roles: [] };
    }

    return {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((role) => ({
        name: role.name,
        permissions: role.permissions.map((permission) => ({
          name: permission.name,
        })),
      })),
    };
  }
}
