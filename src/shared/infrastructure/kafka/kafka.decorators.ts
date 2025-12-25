import { Inject, Logger, SetMetadata } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import {
  KAFKA_CONSUMER_METADATA,
  KafkaConsumerMetadata,
} from './kafka.constants';
import type { KafkaTopic } from './kafka-topics.constant';
import type { KafkaService as KafkaServiceType } from './kafka.service';

export const KafkaProducer = () => Inject(KafkaService);

export const KafkaConsumer = (
  topic: string,
  groupId?: string,
): MethodDecorator => {
  const metadata: KafkaConsumerMetadata = { topic, groupId };
  return SetMetadata(KAFKA_CONSUMER_METADATA, metadata);
};

type MaybePromise<T> = T | Promise<T>;

type ErrorLogger = {
  error(message: string, trace?: string): void;
};

const toPlain = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value ?? null)) as T;

const resolveContextName = (instance: unknown, target: unknown): string => {
  if (
    instance &&
    typeof (instance as { constructor?: { name?: string } }).constructor
      ?.name === 'string'
  ) {
    return (
      (instance as { constructor: { name: string } }).constructor.name ||
      'KafkaEmit'
    );
  }
  if (
    target &&
    typeof (target as { constructor?: { name?: string } }).constructor?.name ===
      'string' &&
    (target as { constructor: { name: string } }).constructor.name !==
      'Function'
  ) {
    return (target as { constructor: { name: string } }).constructor.name;
  }
  if (target && typeof (target as { name?: string }).name === 'string') {
    return (target as { name: string }).name || 'KafkaEmit';
  }
  return 'KafkaEmit';
};

const resolveLogger = (
  instance: unknown,
  fallbackContext: string,
): ErrorLogger => {
  const candidate = (instance as { logger?: ErrorLogger }).logger;
  if (candidate && typeof candidate.error === 'function') {
    return candidate;
  }
  return new Logger(fallbackContext);
};

export interface KafkaEmitContext<
  TResult = unknown,
  TArgs extends unknown[] = unknown[],
> {
  readonly result: TResult;
  readonly args: TArgs;
  readonly instance: unknown;
  readonly toPlain: typeof toPlain;
}

export interface KafkaEmitOptions<
  TResult = unknown,
  TArgs extends unknown[] = unknown[],
> {
  readonly topic: KafkaTopic;
  readonly payload: (
    context: KafkaEmitContext<TResult, TArgs>,
  ) => MaybePromise<Record<string, unknown>>;
  readonly includeTimestamp?: boolean;
}

export const KafkaEmit = <
  TArgs extends unknown[] = unknown[],
  TResult = unknown,
>(
  options: KafkaEmitOptions<TResult, TArgs>,
): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    if (typeof original !== 'function') {
      throw new Error(
        `@KafkaEmit can only decorate methods. "${String(propertyKey)}" is not callable.`,
      );
    }

    descriptor.value = async function (...args: unknown[]) {
      const result = await Promise.resolve(original.apply(this, args));
      const instance = this as Record<string, unknown>;
      const contextName = resolveContextName(instance, target);
      const kafkaService = instance.kafkaService as
        | KafkaServiceType
        | undefined;
      if (!kafkaService || typeof kafkaService.emit !== 'function') {
        const logger = resolveLogger(instance, contextName);
        logger.error(
          `@KafkaEmit: kafkaService not found or does not implement emit() on ${contextName}.${String(
            propertyKey,
          )}. Event for topic ${options.topic} will be skipped.`,
        );
        return result;
      }

      const getLogger = (): ErrorLogger => resolveLogger(instance, contextName);

      const context: KafkaEmitContext<TResult, TArgs> = {
        result: result as TResult,
        args: args as TArgs,
        instance,
        toPlain,
      };

      let payloadBase: Record<string, unknown>;
      try {
        payloadBase = await Promise.resolve(options.payload(context));
      } catch (error) {
        const logger = getLogger();
        if (error instanceof Error) {
          logger.error(
            `Failed to build Kafka payload for topic ${options.topic}: ${error.message}`,
            error.stack,
          );
        } else {
          logger.error(
            `Failed to build Kafka payload for topic ${options.topic}: ${JSON.stringify(error)}`,
          );
        }
        return result;
      }

      const includeTimestamp = options.includeTimestamp !== false;
      const basePayload = payloadBase ?? {};
      const payload = includeTimestamp
        ? Object.prototype.hasOwnProperty.call(basePayload, 'timestamp')
          ? basePayload
          : { timestamp: new Date().toISOString(), ...basePayload }
        : basePayload;

      try {
        // Fire-and-forget emission. The KafkaService.emit already logs
        // internal failures; we avoid awaiting here so the decorated
        // method's happy path isn't blocked by transient Kafka issues.
        void kafkaService.emit(options.topic, toPlain(payload ?? {}));
      } catch (error) {
        const logger = getLogger();
        if (error instanceof Error) {
          logger.error(
            `Failed to emit Kafka event ${options.topic}: ${error.message}`,
            error.stack,
          );
        } else {
          logger.error(
            `Failed to emit Kafka event ${options.topic}: ${JSON.stringify(error)}`,
          );
        }
      }

      return result;
    };

    return descriptor;
  };
};

export const toKafkaPlain = toPlain;
