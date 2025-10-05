import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { Restaurant } from '../../restaurant/entities/restaurant.entity.js';

@Entity({ name: 'review' })
export class Review {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Restaurant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: Restaurant;

  @Column({ type: 'int', name: 'rating', nullable: false })
  rating: number; // 1..5

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
