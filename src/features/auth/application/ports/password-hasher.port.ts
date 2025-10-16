export const AUTH_PASSWORD_HASHER = Symbol('AUTH_PASSWORD_HASHER');

export interface AuthPasswordHasherPort {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
