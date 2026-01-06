import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserOrmEntity } from '../database/typeorm/entities/user.orm-entity';

/**
 * Event types from Auth MS
 */
const EVENT_TYPES = {
  USER_SIGNED_UP: 'user.signed-up',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_LOGGED_IN: 'user.logged-in',
  USER_LOGGED_OUT: 'user.logged-out',
} as const;

interface UserEventPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  phone?: string;
}

interface BaseAuthEvent {
  type: string;
  payload: UserEventPayload;
  timestamp: string;
  correlationId: string;
}

/**
 * Consumes user events from Auth MS to keep a read-only copy
 * of user data in the Gateway database for local queries.
 */
@Injectable()
export class UserSyncConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserSyncConsumer.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('UserSyncConsumer initialized - listening for auth events');
  }

  @EventPattern('mesa-ya.auth.events')
  async handleAuthEvent(@Payload() event: BaseAuthEvent): Promise<void> {
    this.logger.debug(`Received auth event: ${event.type}`);

    switch (event.type) {
      case EVENT_TYPES.USER_SIGNED_UP:
      case EVENT_TYPES.USER_CREATED:
        await this.handleUserCreated(event.payload);
        break;
      case EVENT_TYPES.USER_UPDATED:
        await this.handleUserUpdated(event.payload);
        break;
      default:
        // Log-in/log-out events don't require sync
        this.logger.debug(`Ignoring event type: ${event.type}`);
    }
  }

  private async handleUserCreated(payload: UserEventPayload): Promise<void> {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { id: payload.userId },
      });

      if (existingUser) {
        this.logger.warn(
          `User ${payload.userId} already exists, updating instead`,
        );
        await this.handleUserUpdated(payload);
        return;
      }

      const user = this.userRepo.create({
        id: payload.userId,
        email: payload.email,
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        phone: payload.phone || '',
        // Password is not synced - only Auth MS manages passwords
        passwordHash: 'SYNCED_FROM_AUTH_MS',
        active: true,
      });

      await this.userRepo.save(user);
      this.logger.log(`Synced new user: ${payload.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to sync user creation: ${payload.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async handleUserUpdated(payload: UserEventPayload): Promise<void> {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { id: payload.userId },
      });

      if (!existingUser) {
        this.logger.warn(
          `User ${payload.userId} not found for update, creating instead`,
        );
        await this.handleUserCreated(payload);
        return;
      }

      existingUser.email = payload.email;
      existingUser.name = `${payload.firstName} ${payload.lastName}`.trim();
      if (payload.phone) {
        existingUser.phone = payload.phone;
      }

      await this.userRepo.save(existingUser);
      this.logger.log(`Synced user update: ${payload.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to sync user update: ${payload.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
