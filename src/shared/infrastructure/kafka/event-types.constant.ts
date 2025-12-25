/**
 * Tipos de eventos para Kafka.
 * Usar en el campo `event_type` del payload.
 */
export const EVENT_TYPES = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
  // Auth-specific
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  ROLES_UPDATED: 'roles_updated',
  PERMISSIONS_UPDATED: 'permissions_updated',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
