export const USER_REVIEW_READER = Symbol('USER_REVIEW_READER');

export interface UserReviewReaderPort {
  exists(userId: string): Promise<boolean>;
}
