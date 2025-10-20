import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dish' })
export class DishOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'dish_id' })
  id: string;

  @Column({ type: 'int', name: 'restaurant_id', nullable: false })
  restaurantId: number;

  @Column({ type: 'varchar', length: 150, name: 'name', nullable: false })
  name: string;

  @Column({ type: 'text', name: 'description', nullable: false })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'price',
    nullable: false,
  })
  price: number;

  @Column({ type: 'int', name: 'image_id', nullable: true })
  imageId?: number | null;

  @Column({ type: 'uuid', name: 'menu_id', nullable: true })
  menuId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
