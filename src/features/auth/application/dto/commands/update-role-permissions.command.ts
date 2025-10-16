export class UpdateRolePermissionsCommand {
  constructor(
    public readonly roleName: string,
    public readonly permissionNames: string[],
  ) {}
}
