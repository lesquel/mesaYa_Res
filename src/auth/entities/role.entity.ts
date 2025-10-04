import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity.js';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'name' })
  @Index({ unique: true })
  name: string; // e.g., "ADMIN", "OWNER", "USER"

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];
}
