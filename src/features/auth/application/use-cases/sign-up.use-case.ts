import { Inject, Injectable } from '@nestjs/common';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { AuthRole, AuthRoleName } from '../../domain/entities/auth-role.entity';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { SignUpCommand } from '../dto/commands/sign-up.command';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepositoryPort,
} from '../ports/user.repository.port';
import {
  AUTH_ROLE_REPOSITORY,
  type AuthRoleRepositoryPort,
} from '../ports/role.repository.port';
import {
  AUTH_PASSWORD_HASHER,
  type AuthPasswordHasherPort,
} from '../ports/password-hasher.port';
import {
  AUTH_TOKEN_SERVICE,
  type AuthTokenServicePort,
} from '../ports/token.service.port';
import { AuthTokenResponse } from '../dto/responses/auth-token.response';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roles: AuthRoleRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER)
    private readonly hasher: AuthPasswordHasherPort,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: AuthTokenServicePort,
  ) {}

  async execute(command: SignUpCommand): Promise<AuthTokenResponse> {
    const existing = await this.users.findByEmail(command.email);
    if (existing) {
      throw new EmailAlreadyInUseError(command.email);
    }

    let defaultRole = await this.roles.findByName(AuthRoleName.USER);
    if (!defaultRole) {
      defaultRole = await this.roles.save(
        new AuthRole({ name: AuthRoleName.USER }),
      );
    }

    const passwordHash = await this.hasher.hash(command.password);

    const user = new AuthUser({
      email: command.email,
      name: command.name,
      phone: command.phone,
      passwordHash,
      roles: [defaultRole],
      active: true,
    });

    const savedUser = await this.users.save(user);
    const token = await this.tokens.sign(savedUser);

    return {
      user: savedUser,
      token,
    };
  }
}
