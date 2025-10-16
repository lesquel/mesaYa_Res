export const TABLE_EVENT_PUBLISHER = Symbol('TABLE_EVENT_PUBLISHER');

export type TableEventType =
  | 'table.created'
  | 'table.updated'
  | 'table.deleted';

export interface TableEventPayload {
  type: TableEventType;
  tableId: string;
  sectionId: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
}

export interface TableEventPublisherPort {
  publish(event: TableEventPayload): Promise<void>;
}
