export class UpdateUserRolesCommand {
  constructor(
    public readonly userId: string,
    public readonly roleNames: string[],
  ) {}
}
