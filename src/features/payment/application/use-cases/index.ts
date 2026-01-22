/**
 * Payment Use Cases
 *
 * Most use cases have been deprecated as payment operations
 * are now handled by the Payment Microservice.
 *
 * Only analytics use case is kept for reporting purposes.
 */

// Analytics - still used for dashboard reporting
export * from './get-payment-analytics.use-case';

// Legacy exports - deprecated, kept for backward compatibility
// These are no longer registered in the module providers
export * from './create-payment.use-case';
export * from './get-payment-by-id.use-case';
export * from './get-payment-by-id-result.use-case';
export * from './get-all-payments.use-case';
export * from './update-payment-status.use-case';
export * from './delete-payment.use-case';

