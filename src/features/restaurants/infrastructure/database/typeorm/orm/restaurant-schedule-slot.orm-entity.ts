import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RestaurantOrmEntity } from './restaurant.orm-entity';

@Entity({ name: 'restaurant_schedule_slot' })
export class RestaurantScheduleSlotOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'schedule_slot_id' })
  id: string;

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: false })
  restaurantId: string;

  @ManyToOne(() => RestaurantOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @Column({ type: 'varchar', length: 120, name: 'summary', nullable: false })
  summary: string;

  @Column({ type: 'varchar', length: 16, name: 'weekday', nullable: false })
  day: string;

  @Column({ type: 'time', name: 'open_time', nullable: false })
  openTime: string;

  @Column({ type: 'time', name: 'close_time', nullable: false })
  closeTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
