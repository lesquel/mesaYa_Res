import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity.js';

export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'user' })
export class User {
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

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  @Column({ type: 'boolean', name: 'active', default: true })
  active: boolean;
}
