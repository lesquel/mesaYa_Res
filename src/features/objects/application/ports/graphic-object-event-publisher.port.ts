export const GRAPHIC_OBJECT_EVENT_PUBLISHER = Symbol(
  'GRAPHIC_OBJECT_EVENT_PUBLISHER',
);

export type GraphicObjectEventType =
  | 'object.created'
  | 'object.updated'
  | 'object.deleted';

export interface GraphicObjectEventPayload {
  type: GraphicObjectEventType;
  objectId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface GraphicObjectEventPublisherPort {
  publish(event: GraphicObjectEventPayload): Promise<void>;
}
