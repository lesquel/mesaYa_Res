import { AuthPermission } from './auth-permission.entity';

export { AuthRoleName } from '../enums';

export interface AuthRoleProps {
  id?: string | null;
  name: string;
  permissions?: AuthPermission[];
}

export class AuthRole {
  private idValue: string | null;
  private readonly nameValue: string;
  private permissionsValue: AuthPermission[];

  constructor(props: AuthRoleProps) {
    this.idValue = props.id ?? null;
    this.nameValue = props.name;
    this.permissionsValue = props.permissions ?? [];
  }

  get id(): string | null {
    return this.idValue;
  }

  get name(): string {
    return this.nameValue;
  }

  get permissions(): AuthPermission[] {
    return this.permissionsValue;
  }

  setPermissions(permissions: AuthPermission[]): void {
    this.permissionsValue = permissions;
  }

  setId(id: string): void {
    this.idValue = id;
  }
}
