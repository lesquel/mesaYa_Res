import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity.js';

@Entity({ name: 'user' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'email', unique: true })
  @Index({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, name: 'name', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 15, name: 'phone', nullable: false })
  phone: string;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'password_hash',
    nullable: false,
  })
  passwordHash: string;

  @ManyToMany(() => RoleOrmEntity, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: RoleOrmEntity[];

  @Column({ type: 'boolean', name: 'active', default: true })
  active: boolean;
}
