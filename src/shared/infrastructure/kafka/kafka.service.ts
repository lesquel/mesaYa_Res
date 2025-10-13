import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientKafka,
  ClientProxyFactory,
  KafkaContext,
  KafkaOptions,
  ServerKafka,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import type { KafkaConsumerMetadata } from './kafka.constants.js';

interface KafkaConsumerDefinition extends KafkaConsumerMetadata {
  handler: KafkaConsumerHandler;
}

type KafkaConsumerHandler = (
  payload: unknown,
  context: KafkaContext,
) => Promise<unknown> | unknown;

interface KafkaServerRef {
  server: ServerKafka;
  started: boolean;
}

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  private client: ClientKafka | null = null;
  private clientConnected = false;

  private readonly consumerDefinitions: KafkaConsumerDefinition[] = [];
  private readonly consumerServers = new Map<string, KafkaServerRef>();
  private consumersInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy(): Promise<void> {
    await this.disconnectProducer();
    await this.shutdownConsumers();
  }

  async send<TResult = unknown, TPayload = unknown>(
    topic: string,
    payload: TPayload,
  ): Promise<TResult> {
    const client = await this.getOrCreateProducer();
    const response$ = client.send<TResult, TPayload>(topic, payload);
    return firstValueFrom(response$);
  }

  async emit<TPayload = unknown>(
    topic: string,
    payload: TPayload,
  ): Promise<void> {
    const client = await this.getOrCreateProducer();
    const event$ = client.emit<TPayload>(topic, payload) as Observable<unknown>;
    await lastValueFrom(event$);
  }

  addConsumer(definition: KafkaConsumerDefinition): void {
    this.consumerDefinitions.push(definition);
    // Allow re-run of initialization if new handlers are added at runtime.
    this.consumersInitialized = false;
  }

  async initializeConsumers(): Promise<void> {
    if (this.consumerDefinitions.length === 0 || this.consumersInitialized) {
      return;
    }

    const grouped = this.groupConsumersByGroupId();
    const initializationTasks = Array.from(grouped.entries()).map(
      ([groupId, definitions]) =>
        this.startConsumerServer(groupId, definitions),
    );

    await Promise.all(initializationTasks);
    this.consumersInitialized = true;
  }

  private async getOrCreateProducer(): Promise<ClientKafka> {
    if (this.client && this.clientConnected) {
      return this.client;
    }

    const brokers = this.readBrokers();
    const clientId = this.configService.get<string>(
      'KAFKA_CLIENT_ID',
      'mesa-ya',
    );

    const options: KafkaOptions = {
      transport: Transport.KAFKA,
      options: {
        client: { clientId, brokers },
        producer: {
          allowAutoTopicCreation: true,
        },
      },
    };

    this.client = ClientProxyFactory.create(options) as ClientKafka;
    await this.client.connect();
    this.clientConnected = true;
    this.logger.log(`Kafka producer connected (clientId=${clientId})`);

    return this.client;
  }

  private readBrokers(): string[] {
    const brokers = this.configService.get<string>('KAFKA_BROKER');
    if (!brokers) {
      throw new Error('KAFKA_BROKER is not defined');
    }

    return brokers
      .split(',')
      .map((broker) => broker.trim())
      .filter((broker) => broker.length > 0);
  }

  private groupConsumersByGroupId(): Map<string, KafkaConsumerDefinition[]> {
    const grouped = new Map<string, KafkaConsumerDefinition[]>();
    const defaultGroupId = this.getDefaultGroupId();

    for (const definition of this.consumerDefinitions) {
      const groupId = definition.groupId ?? defaultGroupId;
      if (!grouped.has(groupId)) {
        grouped.set(groupId, []);
      }
      grouped.get(groupId)?.push(definition);
    }

    return grouped;
  }

  private getDefaultGroupId(): string {
    const groupId = this.configService.get<string>('KAFKA_GROUP_ID');
    if (!groupId) {
      throw new Error('KAFKA_GROUP_ID is not defined');
    }
    return groupId;
  }

  private async startConsumerServer(
    groupId: string,
    definitions: KafkaConsumerDefinition[],
  ): Promise<void> {
    const serverRef = this.getOrCreateServer(groupId);

    definitions.forEach((definition) => {
      const wrappedHandler = async (
        payload: unknown,
        context: KafkaContext,
      ) => {
        const result = await definition.handler(payload, context);
        return result ?? null;
      };

      serverRef.server.addHandler(definition.topic, wrappedHandler, true);
    });

    if (!serverRef.started) {
      serverRef.started = true;
      await serverRef.server.listen(() =>
        this.logger.log(`Kafka consumer ready (groupId=${groupId})`),
      );
    }
  }

  private getOrCreateServer(groupId: string): KafkaServerRef {
    const existing = this.consumerServers.get(groupId);
    if (existing) {
      return existing;
    }

    const brokers = this.readBrokers();
    const clientId = this.configService.get<string>(
      'KAFKA_CLIENT_ID',
      'mesa-ya',
    );

    const server = new ServerKafka({
      client: {
        clientId: `${clientId}-consumer-${groupId}`,
        brokers,
      },
      consumer: {
        groupId,
        allowAutoTopicCreation: true,
      },
      run: {
        autoCommit: true,
      },
    });

    const ref: KafkaServerRef = { server, started: false };
    this.consumerServers.set(groupId, ref);
    return ref;
  }

  private async disconnectProducer(): Promise<void> {
    if (this.client && this.clientConnected) {
      await this.client.close();
      this.clientConnected = false;
      this.logger.log('Kafka producer disconnected');
    }
  }

  private async shutdownConsumers(): Promise<void> {
    await Promise.all(
      Array.from(this.consumerServers.values()).map(async ({ server }) => {
        await server.close();
      }),
    );
    this.consumerServers.clear();
    this.logger.log('Kafka consumers stopped');
  }
}
