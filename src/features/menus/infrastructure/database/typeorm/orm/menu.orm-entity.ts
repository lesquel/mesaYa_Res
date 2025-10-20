import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'menu' })
export class MenuOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'menu_id' })
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

  @Column({ type: 'varchar', length: 255, name: 'image_url', nullable: false })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
