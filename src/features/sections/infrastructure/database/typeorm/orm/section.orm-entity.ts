import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure/index';

@Entity({ name: 'section' })
export class SectionOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'section_id' })
  id: string;

  @ManyToOne(() => RestaurantOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @RelationId((section: SectionOrmEntity) => section.restaurant)
  restaurantId: string;

  @Column({ type: 'varchar', length: 50, name: 'name', nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string | null;

  @Column({ type: 'int', name: 'width', nullable: false })
  width: number;

  @Column({ type: 'int', name: 'height', nullable: false })
  height: number;
}
