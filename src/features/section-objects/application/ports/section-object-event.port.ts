export const SECTION_OBJECT_EVENT_PUBLISHER = Symbol(
  'SECTION_OBJECT_EVENT_PUBLISHER',
);

export type SectionObjectEventType =
  | 'section-object.created'
  | 'section-object.updated'
  | 'section-object.deleted';

export interface SectionObjectEventPayload {
  type: SectionObjectEventType;
  sectionObjectId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface SectionObjectEventPublisherPort {
  publish(event: SectionObjectEventPayload): Promise<void>;
}
