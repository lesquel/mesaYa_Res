import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'restaurant' })
export class Restaurant {
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
  openTime: string; // HH:mm

  @Column({ type: 'time', name: 'close_time', nullable: true })
  closeTime: string; // HH:mm

  @Column({ type: 'varchar', name: 'days_open', array: true, nullable: true })
  daysOpen: string[]; // e.g., ['MONDAY','TUESDAY']

  @Column({ type: 'int', name: 'total_capacity', nullable: false })
  totalCapacity: number;

  // FK to subscription (relation can be defined when Subscription entity exists)
  @Column({ type: 'int', name: 'subscription_id', nullable: false })
  subscriptionId: number;

  // FK to image (optional depending on design)
  @Column({ type: 'int', name: 'image_id', nullable: true })
  imageId?: number | null;

  @Column({ type: 'boolean', name: 'active', nullable: false })
  active: boolean;
}
