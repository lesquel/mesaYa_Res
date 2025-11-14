import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'restaurant_schedule_exception' })
export class RestaurantScheduleExceptionOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: false })
  restaurantId: string;

  @Column({ type: 'date', name: 'start_date', nullable: false })
  startDate: string;

  @Column({ type: 'date', name: 'end_date', nullable: false })
  endDate: string;

  @Column({ type: 'varchar', length: 500, name: 'reason', nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
