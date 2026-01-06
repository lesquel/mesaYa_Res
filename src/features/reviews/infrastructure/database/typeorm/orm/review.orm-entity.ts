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
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';

@Entity({ name: 'review' })
export class ReviewOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  id: string;

  /**
   * Reference to user in Auth MS - no FK constraint.
   * The user_id comes from JWT token (sub claim).
   */
  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => RestaurantOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: RestaurantOrmEntity;

  @RelationId((review: ReviewOrmEntity) => review.restaurant)
  restaurantId: string;

  @Column({ type: 'int', name: 'rating', nullable: false })
  rating: number;

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
