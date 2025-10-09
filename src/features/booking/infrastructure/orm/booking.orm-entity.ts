import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../auth/entities/user.entity.js';
import { RestaurantOrmEntity } from '../../../restaurants/infrastructure/index.js';

@Entity({ name: 'booking' })
export class BookingOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'booking_id' })
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => RestaurantOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @RelationId((booking: BookingOrmEntity) => booking.restaurant)
  restaurantId: string;

  @RelationId((booking: BookingOrmEntity) => booking.user)
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
