import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RestaurantOrmEntity } from '../../features/restaurants/infrastructure/orm/restaurant.orm-entity.js';

@Entity({ name: 'section' })
export class Section {
  @PrimaryGeneratedColumn('uuid', { name: 'section_id' })
  id: string;

  @ManyToOne(() => RestaurantOrmEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @Column({ type: 'varchar', length: 50, name: 'name', nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string | null;
}
