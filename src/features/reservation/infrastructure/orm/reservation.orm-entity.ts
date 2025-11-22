import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { RestaurantOrmEntity } from '../../../restaurants/infrastructure';

@Entity({ name: 'reservation' })
export class ReservationOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'reservation_id' })
  id: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserOrmEntity;

  @ManyToOne(() => RestaurantOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: false })
  restaurantId: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId: string;

  @Column({ type: 'uuid', name: 'table_id', nullable: false })
  tableId: string;

  @Column({ type: 'timestamptz', name: 'reservation_time', nullable: false })
  reservationTime: Date;

  @Column({ type: 'date', name: 'reservation_date', nullable: false })
  reservationDate: Date;

  @Column({ type: 'int', name: 'number_of_guests', nullable: false })
  numberOfGuests: number;

  @Column({ type: 'varchar', name: 'status', length: 20, nullable: false })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
