import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../../../auth/entities/user.entity.js';

@Entity({ name: 'restaurant' })
export class RestaurantOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'restaurant_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'name', nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 200, name: 'location', nullable: false })
  location: string;

  @Column({ type: 'time', name: 'open_time', nullable: true })
  openTime: string;

  @Column({ type: 'time', name: 'close_time', nullable: true })
  closeTime: string;

  @Column({ type: 'varchar', name: 'days_open', array: true, nullable: true })
  daysOpen: string[];

  @Column({ type: 'int', name: 'total_capacity', nullable: false })
  totalCapacity: number;

  @Column({ type: 'int', name: 'subscription_id', nullable: false })
  subscriptionId: number;

  @Column({ type: 'int', name: 'image_id', nullable: true })
  imageId?: number | null;

  @Column({ type: 'boolean', name: 'active', nullable: false })
  active: boolean;

  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId: string | null;

  @ManyToOne(() => UserOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: UserOrmEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
