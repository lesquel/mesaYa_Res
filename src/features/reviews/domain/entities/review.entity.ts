import { randomUUID } from 'node:crypto';
import {
  ReviewComment,
  ReviewRating,
  ReviewRestaurantId,
  ReviewUserId,
} from './values/index';
import {
  type ReviewCreate,
  type ReviewSnapshot,
  type ReviewUpdate,
} from '../types/index';

interface ReviewProps {
  restaurantId: ReviewRestaurantId;
  userId: ReviewUserId;
  rating: ReviewRating;
  comment: ReviewComment;
  createdAt: Date;
  updatedAt: Date;
}

export class Review {
  private constructor(
    private props: ReviewProps,
    private readonly internalId: string,
  ) {}

  static create(props: ReviewCreate, id: string = randomUUID()): Review {
    const now = new Date();

    const aggregated: ReviewProps = {
      restaurantId: new ReviewRestaurantId(props.restaurantId),
      userId: new ReviewUserId(props.userId),
      rating: new ReviewRating(props.rating),
      comment: ReviewComment.create(props.comment ?? null),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };

    return new Review(aggregated, id);
  }

  static rehydrate(snapshot: ReviewSnapshot): Review {
    const aggregated: ReviewProps = {
      restaurantId: new ReviewRestaurantId(snapshot.restaurantId),
      userId: new ReviewUserId(snapshot.userId),
      rating: new ReviewRating(snapshot.rating),
      comment: ReviewComment.create(snapshot.comment),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };

    return new Review(aggregated, snapshot.id);
  }

  get id(): string {
    return this.internalId;
  }

  get restaurantId(): string {
    return this.props.restaurantId.value;
  }

  get userId(): string {
    return this.props.userId.value;
  }

  get rating(): number {
    return this.props.rating.value;
  }

  get comment(): string | null {
    return this.props.comment.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(data: ReviewUpdate): void {
    const nextProps: ReviewProps = {
      ...this.props,
      rating:
        data.rating !== undefined
          ? new ReviewRating(data.rating)
          : this.props.rating,
      comment:
        data.comment !== undefined
          ? ReviewComment.create(data.comment)
          : this.props.comment,
      updatedAt: new Date(),
    };

    this.props = nextProps;
  }

  snapshot(): ReviewSnapshot {
    return {
      id: this.internalId,
      restaurantId: this.props.restaurantId.value,
      userId: this.props.userId.value,
      rating: this.props.rating.value,
      comment: this.props.comment.value,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
