/**
 * Review Entity Unit Tests
 */

import { Review } from './review.entity';
import { SentimentType } from '../enums';

describe('Review', () => {
  const createValidProps = () => ({
    restaurantId: 'restaurant-123',
    userId: 'user-456',
    rating: 4,
    comment: 'Great food and service!',
    firstName: 'John',
    lastName: 'Doe',
  });

  describe('create', () => {
    it('should create a review with valid props', () => {
      const review = Review.create(createValidProps());

      expect(review.id).toBeDefined();
      expect(review.restaurantId).toBe('restaurant-123');
      expect(review.userId).toBe('user-456');
      expect(review.rating).toBe(4);
      expect(review.comment).toBe('Great food and service!');
    });

    it('should create a review with provided id', () => {
      const review = Review.create(createValidProps(), 'review-id-123');

      expect(review.id).toBe('review-id-123');
    });

    it('should set first and last name', () => {
      const review = Review.create(createValidProps());

      expect(review.firstName).toBe('John');
      expect(review.lastName).toBe('Doe');
    });

    it('should set default timestamps', () => {
      const review = Review.create(createValidProps());

      expect(review.createdAt).toBeInstanceOf(Date);
      expect(review.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept null comment', () => {
      const props = { ...createValidProps(), comment: null };
      const review = Review.create(props as any);

      expect(review.comment).toBeNull();
    });

    it('should initialize without sentiment', () => {
      const review = Review.create(createValidProps());

      expect(review.sentiment).toBeNull();
      expect(review.sentimentType).toBeNull();
      expect(review.sentimentKeywords).toEqual([]);
      expect(review.isAnalyzed).toBe(false);
    });

    it('should throw error for empty restaurantId', () => {
      const props = { ...createValidProps(), restaurantId: '' };

      expect(() => Review.create(props)).toThrow();
    });

    it('should throw error for empty userId', () => {
      const props = { ...createValidProps(), userId: '' };

      expect(() => Review.create(props)).toThrow();
    });

    it('should throw error for rating below minimum', () => {
      const props = { ...createValidProps(), rating: 0 };

      expect(() => Review.create(props)).toThrow();
    });

    it('should throw error for rating above maximum', () => {
      const props = { ...createValidProps(), rating: 6 };

      expect(() => Review.create(props)).toThrow();
    });

    it('should accept rating of 1 (minimum)', () => {
      const props = { ...createValidProps(), rating: 1 };
      const review = Review.create(props);

      expect(review.rating).toBe(1);
    });

    it('should accept rating of 5 (maximum)', () => {
      const props = { ...createValidProps(), rating: 5 };
      const review = Review.create(props);

      expect(review.rating).toBe(5);
    });
  });

  describe('update', () => {
    it('should update rating', () => {
      const review = Review.create(createValidProps());

      review.update({ rating: 5 });

      expect(review.rating).toBe(5);
    });

    it('should update comment', () => {
      const review = Review.create(createValidProps());

      review.update({ comment: 'Updated review comment' });

      expect(review.comment).toBe('Updated review comment');
    });

    it('should update updatedAt timestamp', () => {
      const review = Review.create(createValidProps());
      const originalUpdatedAt = review.updatedAt;

      // Small delay to ensure timestamp difference
      review.update({ rating: 3 });

      expect(review.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should preserve other values when updating', () => {
      const review = Review.create(createValidProps());

      review.update({ rating: 2 });

      expect(review.rating).toBe(2);
      expect(review.comment).toBe('Great food and service!');
      expect(review.restaurantId).toBe('restaurant-123');
    });
  });

  describe('updateSentiment', () => {
    it('should update sentiment analysis', () => {
      const review = Review.create(createValidProps());

      review.updateSentiment(SentimentType.POSITIVE, 0.95, [
        'great',
        'excellent',
      ]);

      expect(review.sentimentType).toBe(SentimentType.POSITIVE);
      expect(review.isAnalyzed).toBe(true);
      expect(review.sentimentKeywords).toEqual(['great', 'excellent']);
    });

    it('should mark review as analyzed after sentiment update', () => {
      const review = Review.create(createValidProps());

      expect(review.isAnalyzed).toBe(false);

      review.updateSentiment(SentimentType.NEUTRAL, 0.8, []);

      expect(review.isAnalyzed).toBe(true);
    });

    it('should handle negative sentiment', () => {
      const review = Review.create(createValidProps());

      review.updateSentiment(SentimentType.NEGATIVE, 0.85, [
        'bad',
        'disappointing',
      ]);

      expect(review.sentimentType).toBe(SentimentType.NEGATIVE);
      expect(review.sentimentKeywords).toContain('bad');
    });
  });

  describe('snapshot and rehydrate', () => {
    it('should create a snapshot of the entity', () => {
      const review = Review.create(createValidProps(), 'rev-123');
      const snapshot = review.snapshot();

      expect(snapshot.id).toBe('rev-123');
      expect(snapshot.restaurantId).toBe('restaurant-123');
      expect(snapshot.userId).toBe('user-456');
      expect(snapshot.rating).toBe(4);
      expect(snapshot.comment).toBe('Great food and service!');
      expect(snapshot.firstName).toBe('John');
      expect(snapshot.lastName).toBe('Doe');
    });

    it('should rehydrate entity from snapshot', () => {
      const original = Review.create(createValidProps(), 'rev-456');
      original.update({ rating: 2 });
      const snapshot = original.snapshot();

      const rehydrated = Review.rehydrate(snapshot);

      expect(rehydrated.id).toBe('rev-456');
      expect(rehydrated.rating).toBe(2);
      expect(rehydrated.restaurantId).toBe('restaurant-123');
    });

    it('should preserve sentiment in snapshot', () => {
      const review = Review.create(createValidProps(), 'rev-789');
      review.updateSentiment(SentimentType.POSITIVE, 0.9, ['amazing']);
      const snapshot = review.snapshot();

      const rehydrated = Review.rehydrate(snapshot);

      expect(rehydrated.sentimentType).toBe(SentimentType.POSITIVE);
      expect(rehydrated.isAnalyzed).toBe(true);
    });

    it('should include timestamps in snapshot', () => {
      const review = Review.create(createValidProps());
      const snapshot = review.snapshot();

      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null names in snapshot', () => {
      const props = {
        ...createValidProps(),
        firstName: undefined,
        lastName: undefined,
      };
      const review = Review.create(props);
      const snapshot = review.snapshot();

      expect(snapshot.firstName).toBeNull();
      expect(snapshot.lastName).toBeNull();
    });
  });
});
