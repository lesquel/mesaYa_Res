import { AuthUserOutput } from './auth-user.output';

/**
 * Response de signup/login/refresh con tokens.
 */
export class AuthTokenOutput {
  constructor(
    public readonly user: AuthUserOutput,
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}

  static fromProvider(data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    };
    accessToken: string;
    refreshToken: string;
  }): AuthTokenOutput {
    return new AuthTokenOutput(
      AuthUserOutput.fromProvider(data.user),
      data.accessToken,
      data.refreshToken,
    );
  }
}
