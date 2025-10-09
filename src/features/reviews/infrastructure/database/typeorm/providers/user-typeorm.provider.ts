import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../auth/entities/user.entity.js';
import { type UserReviewReaderPort } from '../../application/ports/index.js';

@Injectable()
export class UserTypeOrmReviewProvider implements UserReviewReaderPort {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async exists(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const count = await this.users.count({ where: { id: userId } });
    return count > 0;
  }
}
