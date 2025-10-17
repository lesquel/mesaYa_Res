import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { LoginCommand } from '../dto/commands/login.command.js';
import { AuthTokenResponse } from '../dto/responses/auth-token.response.js';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepositoryPort,
} from '../ports/user.repository.port.js';
import {
  AUTH_PASSWORD_HASHER,
  type AuthPasswordHasherPort,
} from '../ports/password-hasher.port.js';
import {
  AUTH_TOKEN_SERVICE,
  type AuthTokenServicePort,
} from '../ports/token.service.port.js';

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
