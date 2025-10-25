import { Inject, Injectable } from '@nestjs/common';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { AuthRole, AuthRoleName } from '../../domain/entities/auth-role.entity';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { SignUpCommand } from '../dto/commands/sign-up.command';
import { type AuthUserRepositoryPort } from '../ports/user.repository.port';
import { type AuthRoleRepositoryPort } from '../ports/role.repository.port';
import { type AuthPasswordHasherPort } from '../ports/password-hasher.port';
import { type AuthTokenServicePort } from '../ports/token.service.port';
import { AuthTokenResponse } from '../dto/responses/auth-token.response';
import {
  AUTH_PASSWORD_HASHER,
  AUTH_ROLE_REPOSITORY,
  AUTH_TOKEN_SERVICE,
  AUTH_USER_REPOSITORY,
} from '@features/auth/auth.tokens';

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
