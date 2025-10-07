export abstract class BaseDomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
  }
}
