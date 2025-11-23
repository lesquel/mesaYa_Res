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
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure';
import { TableOrmEntity } from '@features/tables/infrastructure/database/typeorm/orm/table.orm-entity';

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

  @ManyToOne(() => TableOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id', referencedColumnName: 'id' })
  table: TableOrmEntity;

  @RelationId((reservation: ReservationOrmEntity) => reservation.table)
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
