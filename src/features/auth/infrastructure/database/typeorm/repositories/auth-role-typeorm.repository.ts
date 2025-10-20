import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { AuthRoleOrmMapper } from '../mappers/auth-role.orm-mapper';
import { AuthRole } from '../../../../domain/entities/auth-role.entity';
import { type AuthRoleRepositoryPort } from '../../../../application/ports/role.repository.port';

@Injectable()
export class AuthRoleTypeOrmRepository implements AuthRoleRepositoryPort {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repository: Repository<RoleOrmEntity>,
  ) {}

  async findByName(name: string): Promise<AuthRole | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? AuthRoleOrmMapper.toDomain(entity) : null;
  }

  async findByNames(names: string[]): Promise<AuthRole[]> {
    if (!names.length) {
      return [];
    }
    const entities = await this.repository.find({ where: { name: In(names) } });
    return entities.map((entity) => AuthRoleOrmMapper.toDomain(entity));
  }

  async findAll(): Promise<AuthRole[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => AuthRoleOrmMapper.toDomain(entity));
  }

  async save(role: AuthRole): Promise<AuthRole> {
    const entity = AuthRoleOrmMapper.toOrm(role);
    const saved = await this.repository.save(entity);
    const persisted = await this.repository.findOne({
      where: { id: saved.id },
    });
    if (!persisted) {
      throw new Error('Failed to reload saved role');
    }
    return AuthRoleOrmMapper.toDomain(persisted);
  }
}
