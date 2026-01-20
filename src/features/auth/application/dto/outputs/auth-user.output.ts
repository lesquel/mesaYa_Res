/**
 * Información de usuario retornada por el servicio.
 * No contiene tokens.
 */
export class AuthUserOutput {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: Array<{
      name: string;
      permissions: Array<{ name: string }>;
    }>,
  ) {}

  static fromProvider(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }): AuthUserOutput {
    return new AuthUserOutput(
      data.id,
      data.email,
      `${data.firstName} ${data.lastName}`.trim(),
      data.roles.map((roleName) => ({
        name: roleName,
        permissions: [],
      })),
    );
  }
}
