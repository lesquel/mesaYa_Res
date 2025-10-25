import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { type AuthUserRepositoryPort } from '../ports/user.repository.port';
import { type AuthRoleRepositoryPort } from '../ports/role.repository.port';
import { AUTH_USER_REPOSITORY, AUTH_ROLE_REPOSITORY } from '../../auth.tokens';
import { UpdateUserRolesCommand } from '../dto/commands/update-user-roles.command';
import { AuthUser } from '../../domain/entities/auth-user.entity';

@Injectable()
export class UpdateUserRolesUseCase {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
    @Inject(AUTH_ROLE_REPOSITORY)
    private readonly roles: AuthRoleRepositoryPort,
  ) {}

  async execute(command: UpdateUserRolesCommand): Promise<AuthUser> {
    const user = await this.users.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    if (!command.roleNames.length) {
      user.setRoles([]);
    } else {
      const roles = await this.roles.findByNames(command.roleNames);
      user.setRoles(roles);
    }

    return this.users.save(user);
  }
}
