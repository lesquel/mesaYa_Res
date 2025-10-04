import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    @InjectRepository(Permission)
    private readonly perms: Repository<Permission>,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedRbac();
  }

  private async seedRbac() {
    const permissionNames = [
      'restaurant:create',
      'restaurant:update',
      'restaurant:delete',
      'restaurant:read',
      'section:create',
      'section:update',
      'section:delete',
      'section:read',
    ];

    const existingPerms = await this.perms.find();
    const existingSet = new Set(existingPerms.map((p) => p.name));
    const toCreate = permissionNames.filter((n) => !existingSet.has(n));
    if (toCreate.length) {
      await this.perms.save(
        toCreate.map((name) => this.perms.create({ name })),
      );
      this.logger.log(`Created permissions: ${toCreate.join(', ')}`);
    }

    const allPerms = await this.perms.find();
    const permByName = new Map(allPerms.map((p) => [p.name, p] as const));

    const desiredRoles: Array<{ name: string; permNames: string[] }> = [
      { name: 'ADMIN', permNames: permissionNames },
      {
        name: 'OWNER',
        permNames: [
          'restaurant:create',
          'restaurant:update',
          'restaurant:read',
          'section:create',
          'section:update',
          'section:read',
        ],
      },
      { name: 'USER', permNames: ['restaurant:read', 'section:read'] },
    ];

    for (const def of desiredRoles) {
      let role = await this.roles.findOne({ where: { name: def.name } });
      role ??= this.roles.create({ name: def.name, permissions: [] });
      role.permissions = def.permNames
        .map((n) => permByName.get(n)!)
        .filter(Boolean);
      await this.roles.save(role);
    }

    this.logger.log('RBAC seed complete');
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private signToken(user: User) {
    const roleNames = (user.roles ?? []).map((r) =>
      typeof r === 'string' ? r : r.name,
    );
    const payload = { sub: user.id, email: user.email, roles: roleNames };
    return this.jwt.sign(payload);
  }

  async signup(dto: SignUpDto) {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');
    const passwordHash = await this.hashPassword(dto.password);
    // Ensure USER role exists
    let userRole = await this.roles.findOne({ where: { name: 'USER' } });
    userRole ??= await this.roles.save(
      this.roles.create({ name: 'USER', permissions: [] }),
    );

    const user = this.users.create({
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      passwordHash,
      roles: [userRole],
      active: true,
    });
    await this.users.save(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roles: user.roles.map((r) => r.name),
      },
      token: this.signToken(user),
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roles: (user.roles ?? []).map((r) =>
          typeof r === 'string' ? r : r.name,
        ),
      },
      token: this.signToken(user),
    };
  }
}
