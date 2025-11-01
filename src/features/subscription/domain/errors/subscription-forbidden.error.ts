export class SubscriptionForbiddenError extends Error {
  constructor(message = 'Subscription action forbidden') {
    super(message);
    this.name = SubscriptionForbiddenError.name;
  }
}
