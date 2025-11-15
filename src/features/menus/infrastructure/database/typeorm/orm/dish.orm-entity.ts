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

  @Column({ type: 'uuid', name: 'restaurant_id', nullable: false })
  restaurantId: string;

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

  @Column({ type: 'uuid', name: 'image_id', nullable: true })
  imageId?: string | null;

  @Column({ type: 'uuid', name: 'menu_id', nullable: true })
  menuId?: string | null;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'category_name',
    nullable: true,
  })
  categoryName?: string | null;

  @Column({ type: 'text', name: 'category_description', nullable: true })
  categoryDescription?: string | null;

  @Column({ type: 'int', name: 'category_order', nullable: true })
  categoryOrder?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
