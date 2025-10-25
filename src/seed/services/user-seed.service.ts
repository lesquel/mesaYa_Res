import { Inject, Injectable, Logger } from '@nestjs/common';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/application/ports/user.repository.port';
import type { AuthRoleRepositoryPort } from '@features/auth/application/ports/role.repository.port';
import { AUTH_ROLE_REPOSITORY } from '@features/auth/application/ports/role.repository.port';
import type { AuthPasswordHasherPort } from '@features/auth/application/ports/password-hasher.port';
import { AUTH_PASSWORD_HASHER } from '@features/auth/application/ports/password-hasher.port';
import { AuthUser } from '@features/auth/domain/entities/auth-user.entity';
import { usersSeed } from '../data';

@Injectable()
export class UserSeedService {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly userRepository: AuthUserRepositoryPort,
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roleRepository: AuthRoleRepositoryPort,
    @Inject(AUTH_PASSWORD_HASHER)
    private readonly passwordHasher: AuthPasswordHasherPort,
  ) {}

  async seedUsers(): Promise<void> {
    this.logger.log('👤 Seeding users...');

    // Check if users already exist by trying to find a known email
    const existingUser = await this.userRepository.findByEmail(
      usersSeed[0].email,
    );
    if (existingUser) {
      this.logger.log('⏭️  Users already exist, skipping...');
      return;
    }

    for (const userSeed of usersSeed) {
      const roles = await this.roleRepository.findByNames(userSeed.roles);
      const passwordHash = await this.passwordHasher.hash(userSeed.password);

      const user = new AuthUser({
        email: userSeed.email,
        name: userSeed.name,
        phone: userSeed.phone,
        passwordHash,
        roles,
        active: userSeed.active,
      });

      await this.userRepository.save(user);
    }

    this.logger.log(`✅ Created ${usersSeed.length} users`);
  }
}
