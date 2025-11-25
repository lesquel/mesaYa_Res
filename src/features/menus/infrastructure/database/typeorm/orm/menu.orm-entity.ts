import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImageOrmEntity } from '@features/images/infrastructure/database/typeorm/orm';

@Entity({ name: 'menu' })
export class MenuOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'menu_id' })
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
  imageId: string | null;

  @ManyToOne(() => ImageOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'image_id' })
  image?: ImageOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
