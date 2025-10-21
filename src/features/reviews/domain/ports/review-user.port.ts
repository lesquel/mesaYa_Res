export const REVIEW_USER_PORT: unique symbol = Symbol('REVIEW_USER_PORT');

export interface ReviewUserPort {
  exists(userId: string): Promise<boolean>;
}
