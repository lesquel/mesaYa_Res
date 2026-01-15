/**
 * Webhook Log Entity
 *
 * Tracks all outgoing and incoming webhooks for audit and debugging.
 */

import { randomUUID } from 'node:crypto';
import type { PartnerEventType } from './partner.entity';

export type WebhookDirection = 'outgoing' | 'incoming';
export type WebhookStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface WebhookLogProps {
  id?: string;
  partnerId: string;
  direction: WebhookDirection;
  eventType: PartnerEventType | string;
  payload: Record<string, unknown>;
  status?: WebhookStatus;
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount?: number;
  createdAt?: Date;
  completedAt?: Date;
}

export class WebhookLog {
  private readonly _id: string;
  private readonly _partnerId: string;
  private readonly _direction: WebhookDirection;
  private readonly _eventType: string;
  private readonly _payload: Record<string, unknown>;
  private _status: WebhookStatus;
  private _statusCode?: number;
  private _responseBody?: string;
  private _errorMessage?: string;
  private _retryCount: number;
  private readonly _createdAt: Date;
  private _completedAt?: Date;

  constructor(props: WebhookLogProps) {
    this._id = props.id ?? randomUUID();
    this._partnerId = props.partnerId;
    this._direction = props.direction;
    this._eventType = props.eventType;
    this._payload = props.payload;
    this._status = props.status ?? 'pending';
    this._statusCode = props.statusCode;
    this._responseBody = props.responseBody;
    this._errorMessage = props.errorMessage;
    this._retryCount = props.retryCount ?? 0;
    this._createdAt = props.createdAt ?? new Date();
    this._completedAt = props.completedAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get direction(): WebhookDirection {
    return this._direction;
  }

  get eventType(): string {
    return this._eventType;
  }

  get payload(): Record<string, unknown> {
    return { ...this._payload };
  }

  get status(): WebhookStatus {
    return this._status;
  }

  get statusCode(): number | undefined {
    return this._statusCode;
  }

  get responseBody(): string | undefined {
    return this._responseBody;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get retryCount(): number {
    return this._retryCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  // Business methods
  markAsSuccess(statusCode: number, responseBody?: string): void {
    this._status = 'success';
    this._statusCode = statusCode;
    this._responseBody = responseBody;
    this._completedAt = new Date();
  }

  markAsFailed(errorMessage: string, statusCode?: number): void {
    this._status = 'failed';
    this._errorMessage = errorMessage;
    this._statusCode = statusCode;
    this._completedAt = new Date();
  }

  markAsRetrying(): void {
    this._status = 'retrying';
    this._retryCount++;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      partnerId: this._partnerId,
      direction: this._direction,
      eventType: this._eventType,
      payload: this._payload,
      status: this._status,
      statusCode: this._statusCode,
      responseBody: this._responseBody,
      errorMessage: this._errorMessage,
      retryCount: this._retryCount,
      createdAt: this._createdAt.toISOString(),
      completedAt: this._completedAt?.toISOString(),
    };
  }
}
