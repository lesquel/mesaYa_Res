/**
 * Datos validados de signup en la capa de aplicación.
 * Ya pasaron por validación HTTP.
 */
export class SignUpInput {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string, // Nombre completo desde HTTP
    public readonly phone?: string,
  ) {}

  /**
   * Mapea nombre completo a firstName.
   * Lógica de transformación centralizada.
   */
  getFirstName(): string {
    const [firstName] = (this.name || '').split(' ');
    return firstName || '';
  }

  /**
   * Mapea nombre completo a lastName.
   */
  getLastName(): string {
    const [, ...lastNameParts] = (this.name || '').split(' ');
    return lastNameParts.join(' ') || '';
  }
}
