/**
 * Partner Entity - Domain entity for B2B webhook partners
 *
 * Represents an external partner that can receive webhooks from our system.
 * Each partner has a unique secret for HMAC signature verification.
 */

import { randomUUID } from 'node:crypto';

export type PartnerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface PartnerProps {
  name: string;
  webhookUrl: string;
  secret: string;
  events: string[];
  status: PartnerStatus;
  metadata?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PartnerSnapshot extends PartnerProps {
  id: string;
}

export interface CreatePartnerProps {
  name: string;
  webhookUrl: string;
  events: string[];
  metadata?: Record<string, string>;
}

export class PartnerEntity {
  private constructor(
    private readonly _id: string,
    private props: PartnerProps,
  ) {}

  static create(props: CreatePartnerProps, id: string = randomUUID()): PartnerEntity {
    const secret = PartnerEntity.generateSecret();
    const now = new Date();

    return new PartnerEntity(id, {
      name: props.name,
      webhookUrl: props.webhookUrl,
      secret,
      events: props.events,
      status: 'ACTIVE',
      metadata: props.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(snapshot: PartnerSnapshot): PartnerEntity {
    return new PartnerEntity(snapshot.id, {
      name: snapshot.name,
      webhookUrl: snapshot.webhookUrl,
      secret: snapshot.secret,
      events: snapshot.events,
      status: snapshot.status,
      metadata: snapshot.metadata,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  private static generateSecret(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get webhookUrl(): string {
    return this.props.webhookUrl;
  }

  get secret(): string {
    return this.props.secret;
  }

  get events(): string[] {
    return [...this.props.events];
  }

  get status(): PartnerStatus {
    return this.props.status;
  }

  get metadata(): Record<string, string> {
    return { ...this.props.metadata };
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  subscribesToEvent(eventType: string): boolean {
    return this.props.events.includes(eventType) || this.props.events.includes('*');
  }

  updateWebhookUrl(url: string): void {
    this.props.webhookUrl = url;
    this.props.updatedAt = new Date();
  }

  updateEvents(events: string[]): void {
    this.props.events = events;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.status = 'INACTIVE';
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    this.props.status = 'SUSPENDED';
    this.props.updatedAt = new Date();
  }

  regenerateSecret(): string {
    this.props.secret = PartnerEntity.generateSecret();
    this.props.updatedAt = new Date();
    return this.props.secret;
  }

  snapshot(): PartnerSnapshot {
    return {
      id: this._id,
      ...this.props,
    };
  }
}
