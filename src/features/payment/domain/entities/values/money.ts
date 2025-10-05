export class Money {
  constructor(private readonly value: number) {
    if (value <= 0) throw new Error('Amount must be greater than 0');
  }
  get amount(): number {
    return this.value;
  }
}
