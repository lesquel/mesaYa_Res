import { Inject, SetMetadata } from '@nestjs/common';
import { KafkaService } from './kafka.service.js';
import {
  KAFKA_CONSUMER_METADATA,
  KafkaConsumerMetadata,
} from './kafka.constants.js';

export const KafkaProducer = () => Inject(KafkaService);

export const KafkaConsumer = (
  topic: string,
  groupId?: string,
): MethodDecorator => {
  const metadata: KafkaConsumerMetadata = { topic, groupId };
  return SetMetadata(KAFKA_CONSUMER_METADATA, metadata);
};
