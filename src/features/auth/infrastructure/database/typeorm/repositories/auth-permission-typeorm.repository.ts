import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { AuthPermissionOrmMapper } from '../mappers/auth-permission.orm-mapper';
import { AuthPermission } from '../../../../domain/entities/auth-permission.entity';
import { type AuthPermissionRepositoryPort } from '../../../../application/ports/permission.repository.port';

@Injectable()
export class AuthPermissionTypeOrmRepository
  implements AuthPermissionRepositoryPort
{
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly repository: Repository<PermissionOrmEntity>,
  ) {}

  async findByNames(names: string[]): Promise<AuthPermission[]> {
    if (!names.length) {
      return [];
    }
    const entities = await this.repository.find({ where: { name: In(names) } });
    return entities.map((entity) => AuthPermissionOrmMapper.toDomain(entity));
  }

  async findAll(): Promise<AuthPermission[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => AuthPermissionOrmMapper.toDomain(entity));
  }

  async save(permission: AuthPermission): Promise<AuthPermission> {
    const entity = AuthPermissionOrmMapper.toOrm(permission);
    const saved = await this.repository.save(entity);
    return AuthPermissionOrmMapper.toDomain(saved);
  }
}
