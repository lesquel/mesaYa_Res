import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { KafkaContext } from '@nestjs/microservices';
import {
  KAFKA_CONSUMER_METADATA,
  KafkaConsumerMetadata,
} from './kafka.constants.js';
import { KafkaService } from './kafka.service.js';

@Injectable()
export class KafkaConsumerExplorer implements OnApplicationBootstrap {


  private readonly logger = new Logger(KafkaConsumerExplorer.name);
  private readonly metadataScanner = new MetadataScanner();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly kafkaService: KafkaService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance === 'string') {
        return;
      }

      const prototype = Object.getPrototypeOf(instance);
      this.metadataScanner.scanFromPrototype(instance, prototype, (method) => {
        const descriptor = prototype[method];
        if (!descriptor) {
          return;
        }

        const metadata = this.reflector.get<KafkaConsumerMetadata | undefined>(
          KAFKA_CONSUMER_METADATA,
          descriptor,
        );

        if (!metadata) {
          return;
        }

        this.registerConsumer(instance, method, metadata);
      });
    });

    await this.kafkaService.initializeConsumers();
  }

  private registerConsumer(
    instance: Record<string, any>,
    methodName: string,
    metadata: KafkaConsumerMetadata,
  ): void {
    const handler = instance[methodName];

    const boundHandler = async (payload: unknown, context: KafkaContext) =>
      handler.call(instance, payload, context);

    this.kafkaService.addConsumer({
      topic: metadata.topic,
      groupId: metadata.groupId,
      handler: boundHandler,
    });

    this.logger.log(
      `Kafka consumer registered for topic=${metadata.topic} (group=${metadata.groupId ?? 'default'})`,
    );
  }
}
