import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity.js';
import { AuthUserOrmMapper } from '../mappers/auth-user.orm-mapper.js';
import { AuthUser } from '../../../../domain/entities/auth-user.entity.js';
import { type AuthUserRepositoryPort } from '../../../../application/ports/user.repository.port.js';

@Injectable()
export class AuthUserTypeOrmRepository implements AuthUserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? AuthUserOrmMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AuthUserOrmMapper.toDomain(entity) : null;
  }

  async save(user: AuthUser): Promise<AuthUser> {
    const entity = AuthUserOrmMapper.toOrm(user);
    const saved = await this.repository.save(entity);
    const persisted = await this.repository.findOne({ where: { id: saved.id } });
    if (!persisted) {
      throw new Error('Failed to reload saved user');
    }
    return AuthUserOrmMapper.toDomain(persisted);
  }
}
