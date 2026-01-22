export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',  // Added for Payment MS integration
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',          // Added for Payment MS integration
  REFUNDED = 'REFUNDED',      // Added for Payment MS integration
}
