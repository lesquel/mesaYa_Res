/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KAFKA TOPICS - Event-Driven Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DISEÑO OPTIMIZADO:
 * - Un tópico por dominio (agregado) en lugar de uno por acción
 * - El tipo de evento se especifica en el payload con `event_type`
 * - Eventos efímeros (selecting/released) movidos a WebSocket directo
 * - Naming convention: mesa-ya.{domain}.events
 *
 * PAYLOAD ESPERADO:
 * {
 *   event_type: 'created' | 'updated' | 'deleted' | 'status_changed' | ...,
 *   entity_id: string,
 *   timestamp: string (ISO 8601),
 *   data: { ... },
 *   metadata?: { user_id, correlation_id, ... }
 * }
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// Event Types (usar en el campo `event_type` del payload)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Kafka Topics - Un tópico por dominio/agregado
// ─────────────────────────────────────────────────────────────────────────────
export const KAFKA_TOPICS = {
  /**
   * Eventos del dominio Restaurant
   * event_type: created | updated | deleted
   */
  RESTAURANTS: 'mesa-ya.restaurants.events',

  /**
   * Eventos del dominio Section (áreas del restaurante)
   * event_type: created | updated | deleted
   */
  SECTIONS: 'mesa-ya.sections.events',

  /**
   * Eventos del dominio Table
   * event_type: created | updated | deleted
   * NOTA: Eventos efímeros (selecting/released) van por WebSocket, no Kafka
   */
  TABLES: 'mesa-ya.tables.events',

  /**
   * Eventos del dominio Object (mobiliario/decoración)
   * event_type: created | updated | deleted
   */
  OBJECTS: 'mesa-ya.objects.events',

  /**
   * Eventos del dominio SectionObject (relación section-object)
   * event_type: created | updated | deleted
   */
  SECTION_OBJECTS: 'mesa-ya.section-objects.events',

  /**
   * Eventos del dominio Menu
   * Incluye menús y platos (dishes) como sub-entidad
   * event_type: created | updated | deleted
   * entity_subtype: 'menu' | 'dish'
   */
  MENUS: 'mesa-ya.menus.events',

  /**
   * Eventos del dominio Review
   * event_type: created | updated | deleted
   */
  REVIEWS: 'mesa-ya.reviews.events',

  /**
   * Eventos del dominio Image
   * event_type: created | updated | deleted
   */
  IMAGES: 'mesa-ya.images.events',

  /**
   * Eventos del dominio Reservation
   * event_type: created | updated | deleted | status_changed
   */
  RESERVATIONS: 'mesa-ya.reservations.events',

  /**
   * Eventos del dominio Payment
   * event_type: created | updated | deleted | status_changed
   */
  PAYMENTS: 'mesa-ya.payments.events',

  /**
   * Eventos del dominio Subscription
   * Incluye subscripciones y planes como sub-entidades
   * event_type: created | updated | deleted | status_changed
   * entity_subtype: 'subscription' | 'plan'
   */
  SUBSCRIPTIONS: 'mesa-ya.subscriptions.events',

  /**
   * Eventos del dominio Auth/Identity
   * event_type: user_signed_up | user_logged_in | roles_updated | permissions_updated
   */
  AUTH: 'mesa-ya.auth.events',

  /**
   * Eventos del dominio OwnerUpgrade (solicitudes de upgrade)
   * event_type: status_changed
   */
  OWNER_UPGRADE: 'mesa-ya.owner-upgrade.events',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
