export const KAFKA_CONSUMER_METADATA = 'kafka:consumer:metadata';

export interface KafkaConsumerMetadata {
  topic: string;
  groupId?: string;
}
