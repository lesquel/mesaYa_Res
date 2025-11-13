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
import { Kafka, Partitioners, logLevel } from 'kafkajs';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import type { KafkaConsumerMetadata } from './kafka.constants';
import { KAFKA_TOPICS } from './kafka.topics';

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
  private brokerReadyPromise: Promise<void> | null = null;
  private effectiveBrokers: string[] | null = null;

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
    try {
      const client = await this.getOrCreateProducer();
      const event$ = client.emit<TPayload>(
        topic,
        payload,
      ) as Observable<unknown>;

      // Fire-and-forget: subscribe and log errors so the app flow isn't blocked
      // by Kafka internals (leadership election, slow brokers, etc.). This
      // keeps the HTTP/request path responsive while still surfacing issues
      // to logs. The decorator that calls this method already logs payload
      // build errors, so we only log emission failures here.
      event$.subscribe({
        next: () => this.logger.debug(`Kafka event emitted ${topic}`),
        error: (err) =>
          this.logger.error(
            `Kafka emit error for topic=${topic}: ${
              err instanceof Error ? err.message : String(err)
            }`,
            err instanceof Error ? err.stack : undefined,
          ),
      });
    } catch (error) {
      this.logger.error(
        `Failed to emit Kafka event ${topic}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      // Do not rethrow: emitting failures shouldn't break the caller flow.
    }
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

    await this.ensureBrokerReady();

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

    await this.ensureBrokerReady();

    const brokers = this.effectiveBrokers ?? this.readBrokers();
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
          createPartitioner: Partitioners.LegacyPartitioner,
        },
      },
    };

    this.client = ClientProxyFactory.create(options) as ClientKafka;

    // Attempt to connect with a small retry loop. In containerized
    // environments Kafka may not be immediately ready (leader election,
    // group coordinator). Retry a few times before failing to help
    // reliability during startup.
    const maxAttempts = 3;
    const baseDelay = 1000; // ms
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.client.connect();
        this.clientConnected = true;
        this.logger.log(`Kafka producer connected (clientId=${clientId})`);
        return this.client;
      } catch (err) {
        this.logger.warn(
          `Kafka producer connect attempt ${attempt} failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        if (attempt === maxAttempts) {
          this.logger.error('Kafka producer failed to connect after retries');
          throw err;
        }
        await new Promise((r) => setTimeout(r, baseDelay * attempt));
      }
    }

    return this.client;
  }

  private readBrokers(): string[] {
    const brokers =
      this.configService.get<string>('KAFKA_BROKERS') ||
      this.configService.get<string>('KAFKA_BROKER');
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

  private async ensureBrokerReady(): Promise<void> {
    if (this.brokerReadyPromise) {
      return this.brokerReadyPromise;
    }

    this.brokerReadyPromise = this.waitForBrokerAndTopics();
    return this.brokerReadyPromise;
  }

  private async waitForBrokerAndTopics(): Promise<void> {
    const configured = this.readBrokers();
    const clientId = this.configService.get<string>(
      'KAFKA_CLIENT_ID',
      'mesa-ya',
    );

    // Candidate broker lists: try configured brokers first, then common
    // fallbacks that are reachable from inside Docker containers.
    const candidates: string[][] = [configured];

    const internalKafka = 'kafka:9092';
    const localhost9092 = 'localhost:9092';

    if (!configured.includes(internalKafka)) {
      candidates.push([internalKafka]);
    }
    if (!configured.includes(localhost9092)) {
      candidates.push([localhost9092]);
    }

    const maxAttemptsPerCandidate = 3;
    const backoffMs = 2000;
    const requiredTopics = Object.values(KAFKA_TOPICS);

    for (const brokers of candidates) {
      for (let attempt = 1; attempt <= maxAttemptsPerCandidate; attempt++) {
        const kafka = new Kafka({
          clientId: `${clientId}-admin`,
          brokers,
          logLevel: logLevel.ERROR,
        });
        const admin = kafka.admin();
        try {
          this.logger.log(
            `Attempting Kafka admin connect (brokers=${brokers.join(',')}) attempt=${attempt}`,
          );
          await admin.connect();

          const metadata = await admin.fetchTopicMetadata();
          const existingTopics = new Set(
            metadata.topics.map((topic) => topic.name),
          );
          const topicsToCreate = requiredTopics.filter(
            (topic) => !existingTopics.has(topic),
          );

          if (topicsToCreate.length > 0) {
            await admin.createTopics({
              topics: topicsToCreate.map((topic) => ({
                topic,
                numPartitions: 1,
                replicationFactor: 1,
              })),
              waitForLeaders: true,
            });
            this.logger.log(
              `Kafka topics ensured: ${topicsToCreate.join(', ')}`,
            );
          }

          await admin.disconnect();

          // Persist the successful brokers so producer/consumer use same list.
          this.effectiveBrokers = brokers;
          this.logger.log(`Kafka broker ready (brokers=${brokers.join(',')})`);
          return;
        } catch (error) {
          this.logger.warn(
            `Kafka readiness check failed for brokers=${brokers.join(',')} attempt=${attempt}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          try {
            await admin.disconnect();
          } catch {
            // ignore
          }

          if (attempt === maxAttemptsPerCandidate) {
            this.logger.warn(
              `Exhausted attempts for brokers=${brokers.join(',')}, trying next candidate if any...`,
            );
            break; // move to next candidate brokers set
          }

          await new Promise((resolve) =>
            setTimeout(resolve, backoffMs * attempt),
          );
        }
      }
    }

    this.logger.error('Kafka broker not ready after all fallback attempts');
    throw new Error('Kafka broker not ready after retries');
  }
}
