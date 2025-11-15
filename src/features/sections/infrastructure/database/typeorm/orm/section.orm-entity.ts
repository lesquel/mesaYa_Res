import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';
import { TableOrmEntity } from '../../../../../tables/infrastructure/database/typeorm/orm';

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

  @OneToMany(() => TableOrmEntity, (table) => table.section)
  tables: TableOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
