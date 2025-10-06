export abstract class UseCase<Input, Output> {
  abstract execute(input: Input): Promise<Output>;
}
