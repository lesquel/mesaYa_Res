export interface AuthPermissionProps {
  id?: string | null;
  name: string;
}

export class AuthPermission {
  private readonly idValue: string | null;
  private readonly nameValue: string;

  constructor(props: AuthPermissionProps) {
    this.idValue = props.id ?? null;
    this.nameValue = props.name;
  }

  get id(): string | null {
    return this.idValue;
  }

  get name(): string {
    return this.nameValue;
  }
}
