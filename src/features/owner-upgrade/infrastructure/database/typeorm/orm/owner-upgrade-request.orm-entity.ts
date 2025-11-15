import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OwnerUpgradeRequestStatus } from '../../../domain/owner-upgrade-request-status.enum';

@Entity({ name: 'owner_upgrade_request' })
export class OwnerUpgradeRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'owner_upgrade_request_id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 120, name: 'restaurant_name' })
  restaurantName: string;

  @Column({ type: 'text', name: 'restaurant_location' })
  restaurantLocation: string;

  @Column({ type: 'text', name: 'restaurant_description', nullable: true })
  restaurantDescription?: string | null;

  @Column({
    type: 'uuid',
    name: 'preferred_subscription_plan_id',
    nullable: true,
  })
  preferredSubscriptionPlanId?: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'status',
    default: OwnerUpgradeRequestStatus.PENDING,
  })
  status: OwnerUpgradeRequestStatus;

  @Column({ type: 'text', name: 'user_note', nullable: true })
  userNote?: string | null;

  @Column({ type: 'text', name: 'admin_note', nullable: true })
  adminNote?: string | null;

  @Column({ type: 'uuid', name: 'assigned_restaurant_id', nullable: true })
  assignedRestaurantId?: string | null;

  @Column({ type: 'uuid', name: 'processed_by', nullable: true })
  processedBy?: string | null;

  @Column({ type: 'timestamptz', name: 'processed_at', nullable: true })
  processedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
