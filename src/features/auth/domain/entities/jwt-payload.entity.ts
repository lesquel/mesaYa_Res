/**
 * Estructura esperada de un JWT token.
 * Define contrato entre Auth MS y Gateway.
 */
export class JwtPayloadEntity {
  constructor(
    public readonly sub: string, // User ID
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly roles: string[] = [], // Array de nombres de rol
    public readonly permissions: string[] | undefined, // Permisos adicionales si aplica
    public readonly iat: number | undefined, // Issued at
    public readonly exp: number | undefined, // Expiration
    public readonly iss: string | undefined, // Issuer
  ) {}

  /**
   * Valida que los campos obligatorios estén presentes y sean válidos.
   */
  static validate(payload: unknown): JwtPayloadEntity {
    const p = payload as Record<string, unknown>;

    if (!p.sub || typeof p.sub !== 'string') {
      throw new Error('Invalid JWT: missing or invalid sub (user ID)');
    }
    if (!p.email || typeof p.email !== 'string') {
      throw new Error('Invalid JWT: missing or invalid email');
    }
    if (!Array.isArray(p.roles)) {
      throw new Error('Invalid JWT: roles must be an array');
    }

    return new JwtPayloadEntity(
      p.sub,
      p.email,
      p.firstName ? String(p.firstName) : null,
      p.lastName ? String(p.lastName) : null,
      p.roles as string[],
      Array.isArray(p.permissions) ? (p.permissions as string[]) : undefined,
      typeof p.iat === 'number' ? p.iat : undefined,
      typeof p.exp === 'number' ? p.exp : undefined,
      p.iss ? String(p.iss) : undefined,
    );
  }
}
