export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already in use`);
    this.name = EmailAlreadyInUseError.name;
  }
}
