/**
 * Partner Entity
 *
 * Represents a B2B partner that has registered to receive webhooks
 * from MesaYA when specific events occur (e.g., reservation confirmed).
 */

import { randomUUID } from 'node:crypto';

/**
 * Events that partners can subscribe to
 */
export type PartnerEventType =
  | 'reservation.created'
  | 'reservation.confirmed'
  | 'reservation.cancelled'
  | 'reservation.completed'
  | 'payment.created'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded';

/**
 * Partner status
 */
export type PartnerStatus = 'active' | 'inactive' | 'suspended';

export interface PartnerProps {
  id?: string;
  name: string;
  webhookUrl: string;
  secret: string;
  subscribedEvents: PartnerEventType[];
  status?: PartnerStatus;
  description?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastWebhookAt?: Date;
  failedWebhookCount?: number;
}

export class Partner {
  private readonly _id: string;
  private _name: string;
  private _webhookUrl: string;
  private readonly _secret: string;
  private _subscribedEvents: PartnerEventType[];
  private _status: PartnerStatus;
  private _description?: string;
  private _contactEmail?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _lastWebhookAt?: Date;
  private _failedWebhookCount: number;

  constructor(props: PartnerProps) {
    this._id = props.id ?? randomUUID();
    this._name = props.name;
    this._webhookUrl = props.webhookUrl;
    this._secret = props.secret;
    this._subscribedEvents = props.subscribedEvents;
    this._status = props.status ?? 'active';
    this._description = props.description;
    this._contactEmail = props.contactEmail;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
    this._lastWebhookAt = props.lastWebhookAt;
    this._failedWebhookCount = props.failedWebhookCount ?? 0;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get webhookUrl(): string {
    return this._webhookUrl;
  }

  get secret(): string {
    return this._secret;
  }

  get subscribedEvents(): PartnerEventType[] {
    return [...this._subscribedEvents];
  }

  get status(): PartnerStatus {
    return this._status;
  }

  get description(): string | undefined {
    return this._description;
  }

  get contactEmail(): string | undefined {
    return this._contactEmail;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastWebhookAt(): Date | undefined {
    return this._lastWebhookAt;
  }

  get failedWebhookCount(): number {
    return this._failedWebhookCount;
  }

  // Business methods
  updateWebhookUrl(url: string): void {
    this._webhookUrl = url;
    this._updatedAt = new Date();
  }

  updateSubscribedEvents(events: PartnerEventType[]): void {
    this._subscribedEvents = events;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._status = 'active';
    this._failedWebhookCount = 0;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = 'inactive';
    this._updatedAt = new Date();
  }

  suspend(): void {
    this._status = 'suspended';
    this._updatedAt = new Date();
  }

  recordWebhookSuccess(): void {
    this._lastWebhookAt = new Date();
    this._failedWebhookCount = 0;
    this._updatedAt = new Date();
  }

  recordWebhookFailure(): void {
    this._failedWebhookCount++;
    this._updatedAt = new Date();

    // Auto-suspend after 5 consecutive failures
    if (this._failedWebhookCount >= 5) {
      this.suspend();
    }
  }

  isSubscribedTo(eventType: PartnerEventType): boolean {
    return this._subscribedEvents.includes(eventType);
  }

  canReceiveWebhooks(): boolean {
    return this._status === 'active';
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      name: this._name,
      webhookUrl: this._webhookUrl,
      // Note: secret is NOT included for security
      subscribedEvents: this._subscribedEvents,
      status: this._status,
      description: this._description,
      contactEmail: this._contactEmail,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      lastWebhookAt: this._lastWebhookAt?.toISOString(),
      failedWebhookCount: this._failedWebhookCount,
    };
  }
}
