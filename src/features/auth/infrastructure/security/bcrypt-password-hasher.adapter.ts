import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AuthPasswordHasherPort } from '../../application/ports/password-hasher.port';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class BcryptPasswordHasherAdapter implements AuthPasswordHasherPort {
  private readonly saltRounds: number;
  private readonly useBcrypt: boolean;
  private readonly bcryptImpl: any | null = null;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = Number(this.configService.get('AUTH_SALT_ROUNDS') ?? 10);
    // Try to load native bcrypt at runtime. If not available (e.g., not installed
    // or fails to build on Windows), fall back to a pure-Node implementation using scrypt.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.bcryptImpl = require('bcrypt');
      this.useBcrypt = true;
    } catch (err) {
      this.useBcrypt = false;
      this.bcryptImpl = null;
    }
  }

  hash(plain: string): Promise<string> {
    if (this.useBcrypt && this.bcryptImpl?.hash) {
      return this.bcryptImpl.hash(plain, this.saltRounds);
    }

    // Fallback: use scrypt with a random salt. Store as `scrypt$<saltHex>$<derivedHex>`
    return (async () => {
      const salt = randomBytes(16).toString('hex');
      const derived = (await scrypt(plain, salt, 64)) as Buffer;
      return `scrypt$${salt}$${derived.toString('hex')}`;
    })();
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    if (this.useBcrypt && this.bcryptImpl?.compare) {
      return this.bcryptImpl.compare(plain, hashed);
    }

    return (async () => {
      try {
        if (!hashed.startsWith('scrypt$')) return false;
        const [, salt, derivedHex] = hashed.split('$');
        const derived = (await scrypt(plain, salt, 64)) as Buffer;
        return derived.toString('hex') === derivedHex;
      } catch (err) {
        return false;
      }
    })();
  }
}
