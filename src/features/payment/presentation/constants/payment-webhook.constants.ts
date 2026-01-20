/**
 * Payment Webhook Constants
 *
 * Constants used across payment webhook handling.
 */

/**
 * Kafka topic for payment events.
 * Consumers: n8n workflows, notification service, analytics.
 */
export const PAYMENTS_EVENTS_TOPIC = 'mesa-ya.payments.events';

/**
 * Kafka topic for payment status updates.
 */
export const PAYMENTS_STATUS_TOPIC = 'mesa-ya.payments.status';

/**
 * Webhook signature header names by gateway.
 */
export const WEBHOOK_SIGNATURE_HEADERS = {
  stripe: 'stripe-signature',
  paypal: 'paypal-transmission-sig',
  mercadopago: 'x-signature',
} as const;
