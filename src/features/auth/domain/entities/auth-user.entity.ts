import { AuthRole } from './auth-role.entity';

export interface AuthUserProps {
  id?: string | null;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  roles?: AuthRole[];
  active?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class AuthUser {
  private idValue: string | null;
  private readonly emailValue: string;
  private nameValue: string;
  private phoneValue: string;
  private passwordHashValue: string;
  private rolesValue: AuthRole[];
  private activeValue: boolean;
  private createdAtValue: Date | null;
  private updatedAtValue: Date | null;

  constructor(props: AuthUserProps) {
    this.idValue = props.id ?? null;
    this.emailValue = props.email;
    this.nameValue = props.name;
    this.phoneValue = props.phone;
    this.passwordHashValue = props.passwordHash;
    this.rolesValue = props.roles ?? [];
    this.activeValue = props.active ?? true;
    this.createdAtValue = props.createdAt ?? null;
    this.updatedAtValue = props.updatedAt ?? null;
  }

  get id(): string | null {
    return this.idValue;
  }

  get email(): string {
    return this.emailValue;
  }

  get name(): string {
    return this.nameValue;
  }

  get phone(): string {
    return this.phoneValue;
  }

  get passwordHash(): string {
    return this.passwordHashValue;
  }

  get roles(): AuthRole[] {
    return this.rolesValue;
  }

  get active(): boolean {
    return this.activeValue;
  }

  get createdAt(): Date | null {
    return this.createdAtValue;
  }

  get updatedAt(): Date | null {
    return this.updatedAtValue;
  }

  setId(id: string): void {
    this.idValue = id;
  }

  setPasswordHash(hash: string): void {
    this.passwordHashValue = hash;
  }

  setRoles(roles: AuthRole[]): void {
    this.rolesValue = roles;
  }

  setActive(active: boolean): void {
    this.activeValue = active;
  }

  updateProfile(name: string, phone: string): void {
    this.nameValue = name;
    this.phoneValue = phone;
  }

  touchTimestamps(createdAt: Date | null, updatedAt: Date | null): void {
    this.createdAtValue = createdAt;
    this.updatedAtValue = updatedAt;
  }
}
