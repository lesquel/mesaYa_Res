import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { LoginCommand } from '../dto/commands/login.command';
import { AuthTokenResponse } from '../dto/responses/auth-token.response';
import {
  AUTH_USER_REPOSITORY,
  AUTH_PASSWORD_HASHER,
  AUTH_TOKEN_SERVICE,
} from '@features/auth/auth.tokens';
import type { AuthUserRepositoryPort } from '../ports/user.repository.port';
import type { AuthPasswordHasherPort } from '../ports/password-hasher.port';
import type { AuthTokenServicePort } from '../ports/token.service.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER)
    private readonly hasher: AuthPasswordHasherPort,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly tokens: AuthTokenServicePort,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokenResponse> {
    const user = await this.users.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.hasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const token = await this.tokens.sign(user);

    return {
      user,
      token,
    };
  }
}
