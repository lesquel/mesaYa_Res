import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SectionOrmEntity } from '@features/sections/infrastructure/database/typeorm/orm/section.orm-entity';

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

  @Column({ type: 'jsonb', name: 'location_payload', nullable: true })
  locationPayload?: {
    label: string;
    address: string;
    city: string;
    province?: string | null;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    placeId?: string | null;
  } | null;

  @Column({
    type: 'double precision',
    name: 'location_latitude',
    nullable: true,
  })
  locationLatitude?: number | null;

  @Column({
    type: 'double precision',
    name: 'location_longitude',
    nullable: true,
  })
  locationLongitude?: number | null;

  @Column({ type: 'time', name: 'open_time', nullable: true })
  openTime: string;

  @Column({ type: 'time', name: 'close_time', nullable: true })
  closeTime: string;

  @Column({ type: 'varchar', name: 'days_open', array: true, nullable: true })
  daysOpen: string[];

  @Column({ type: 'int', name: 'total_capacity', nullable: false })
  totalCapacity: number;

  @Column({ type: 'uuid', name: 'subscription_id', nullable: false })
  subscriptionId: string;

  @Column({ type: 'uuid', name: 'image_id', nullable: true })
  imageId?: string | null;

  @Column({ type: 'boolean', name: 'active', nullable: false })
  active: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'status',
    nullable: false,
    default: 'ACTIVE',
  })
  status: string;

  @Column({ type: 'varchar', length: 500, name: 'admin_note', nullable: true })
  adminNote?: string | null;

  /**
   * Reference to owner user in Auth MS - no FK constraint.
   * The owner_id comes from JWT token when restaurant is created.
   */
  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId: string | null;

  @OneToMany(() => SectionOrmEntity, (section) => section.restaurant)
  sections: SectionOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
