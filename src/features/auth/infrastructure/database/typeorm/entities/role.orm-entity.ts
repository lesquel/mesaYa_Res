import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';

@Entity({ name: 'role' })
export class RoleOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'name' })
  @Index({ unique: true })
  name: string;

  @ManyToMany(() => PermissionOrmEntity, { eager: true })
  @JoinTable({ name: 'role_permissions' })
  permissions: PermissionOrmEntity[];
}
