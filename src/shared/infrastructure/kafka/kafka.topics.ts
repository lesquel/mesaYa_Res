export const KAFKA_TOPICS = {
  REVIEW_CREATED: 'mesa-ya.reviews.created',
  REVIEW_UPDATED: 'mesa-ya.reviews.updated',
  REVIEW_DELETED: 'mesa-ya.reviews.deleted',
  RESTAURANT_CREATED: 'mesa-ya.restaurants.created',
  RESTAURANT_UPDATED: 'mesa-ya.restaurants.updated',
  RESTAURANT_DELETED: 'mesa-ya.restaurants.deleted',
  SECTION_CREATED: 'mesa-ya.sections.created',
  SECTION_UPDATED: 'mesa-ya.sections.updated',
  SECTION_DELETED: 'mesa-ya.sections.deleted',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
