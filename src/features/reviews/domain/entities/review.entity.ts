import { randomUUID } from 'crypto';
import { InvalidReviewDataError } from '../errors/index.js';

export interface ReviewProps {
  restaurantId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateReviewProps = Omit<
  ReviewProps,
  'comment' | 'createdAt' | 'updatedAt'
> & {
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateReviewProps = Partial<
  Pick<ReviewProps, 'rating' | 'comment'>
>;

export interface ReviewSnapshot extends ReviewProps {
  id: string;
}

export class Review {
  private constructor(
    private props: ReviewProps,
    private readonly _id: string,
  ) {}

  static create(props: CreateReviewProps, id: string = randomUUID()): Review {
    const now = new Date();
    const normalizedComment = Review.normalizeComment(props.comment);

    const reviewProps: ReviewProps = {
      restaurantId: Review.normalizeId(props.restaurantId, 'Restaurant'),
      userId: Review.normalizeId(props.userId, 'User'),
      rating: props.rating,
      comment: normalizedComment,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };

    this.validate(reviewProps);

    return new Review(reviewProps, id);
  }

  static rehydrate(snapshot: ReviewSnapshot): Review {
    this.validate(snapshot);
    return new Review({ ...snapshot }, snapshot.id);
  }

  get id(): string {
    return this._id;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get rating(): number {
    return this.props.rating;
  }

  get comment(): string | null {
    return this.props.comment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(data: UpdateReviewProps): void {
    const nextProps: ReviewProps = {
      ...this.props,
      rating: data.rating ?? this.props.rating,
      comment:
        data.comment !== undefined
          ? Review.normalizeComment(data.comment)
          : this.props.comment,
      updatedAt: new Date(),
    };

    Review.validate(nextProps);

    this.props = nextProps;
  }

  snapshot(): ReviewSnapshot {
    return {
      id: this._id,
      ...this.props,
    };
  }

  private static normalizeId(value: string, label: string): string {
    if (!value || value.trim().length === 0) {
      throw new InvalidReviewDataError(`${label} id is required`);
    }
    return value.trim();
  }

  private static normalizeComment(value?: string | null): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private static validate(props: ReviewProps | ReviewSnapshot): void {
    if (
      !Number.isInteger(props.rating) ||
      props.rating < 1 ||
      props.rating > 5
    ) {
      throw new InvalidReviewDataError(
        'Rating must be an integer between 1 and 5',
      );
    }

    if (!props.restaurantId || props.restaurantId.trim().length === 0) {
      throw new InvalidReviewDataError('Restaurant id is required');
    }

    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvalidReviewDataError('User id is required');
    }

    if (props.comment && props.comment.length > 1000) {
      throw new InvalidReviewDataError(
        'Comment must be at most 1000 characters',
      );
    }
  }
}
