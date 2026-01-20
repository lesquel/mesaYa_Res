/**
 * Datos validados de login en la capa de aplicación.
 */
export class LoginInput {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
