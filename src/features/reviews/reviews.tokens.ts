
// Repositories
export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');
export const REVIEW_ANALYTICS_REPOSITORY = Symbol(
  'REVIEW_ANALYTICS_REPOSITORY',
);

// Domain Ports
export const REVIEW_USER_PORT: unique symbol = Symbol('REVIEW_USER_PORT');
export const REVIEW_RESTAURANT_PORT: unique symbol = Symbol(
  'REVIEW_RESTAURANT_PORT',
);

// External Readers (Application Layer)
export const USER_REVIEW_READER = Symbol('USER_REVIEW_READER');
export const RESTAURANT_REVIEW_READER = Symbol('RESTAURANT_REVIEW_READER');
