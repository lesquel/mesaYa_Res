import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity.js';
import { type UserReviewReaderPort } from '../../../../application/ports/index.js';

@Injectable()
export class UserTypeOrmReviewProvider implements UserReviewReaderPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {}

  async exists(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const count = await this.users.count({ where: { id: userId } });
    return count > 0;
  }
}
