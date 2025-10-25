export const IMAGE_EVENT_PUBLISHER = Symbol('IMAGE_EVENT_PUBLISHER');

export type ImageEventType =
  | 'image.created'
  | 'image.updated'
  | 'image.deleted';

export interface ImageEventPayload {
  type: ImageEventType;
  imageId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface ImageEventPublisherPort {
  publish(event: ImageEventPayload): Promise<void>;
}
