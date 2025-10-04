import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';

@Entity({ name: 'section' })
export class Section {
  @PrimaryGeneratedColumn('uuid', { name: 'section_id' })
  id: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: Restaurant;

  @Column({ type: 'varchar', length: 50, name: 'name', nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string | null;
}
