/**
 * Tipos de salida del proveedor de autenticación.
 * Agnósticos de transporte (Kafka, HTTP, etc).
 */

export interface ProviderUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface ProviderTokenData {
  user: ProviderUserInfo;
  accessToken: string;
  refreshToken: string;
}

/**
 * Puerto: Contrato que debe cumplir un proveedor de autenticación.
 * Implementaciones: KafkaAuthProvider, HttpAuthProvider (futura), MockAuthProvider (testing)
 */
export interface IAuthProvider {
  /**
   * Registra un nuevo usuario en el proveedor.
   * @throws AuthDomainError con código específico del error.
   */
  signUp(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ProviderTokenData>;

  /**
   * Autentica un usuario.
   * @throws AuthDomainError con código específico del error.
   */
  login(payload: { email: string; password: string }): Promise<ProviderTokenData>;

  /**
   * Renueva tokens usando refresh token.
   * @throws AuthDomainError si refresh token es inválido o expiró.
   */
  refreshToken(payload: { refreshToken: string }): Promise<ProviderTokenData>;

  /**
   * Cierra sesión del usuario.
   */
  logout(payload: { userId: string; revokeAll?: boolean }): Promise<void>;

  /**
   * Obtiene información de usuario por ID.
   * @returns null si usuario no existe, nunca lanza error.
   */
  findUserById(userId: string): Promise<ProviderUserInfo | null>;

  /**
   * Obtiene información de usuario por email.
   * @returns null si usuario no existe, nunca lanza error.
   */
  findUserByEmail(email: string): Promise<ProviderUserInfo | null>;
}

/**
 * Token de inyección para el puerto.
 * Permite múltiples implementaciones.
 */
export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');
