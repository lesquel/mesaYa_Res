export class SignUpCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly phone: string,
  ) {}
}
