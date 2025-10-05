import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../auth/entities/user.entity.js';
import { RestaurantOrmEntity } from '../../../restaurants/infrastructure/orm/restaurant.orm-entity.js';

@Entity({ name: 'review' })
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => RestaurantOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @RelationId((review: ReviewOrmEntity) => review.restaurant)
  restaurantId: string;

  @RelationId((review: ReviewOrmEntity) => review.user)
  userId: string;

  @Column({ type: 'int', name: 'rating', nullable: false })
  rating: number;

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
