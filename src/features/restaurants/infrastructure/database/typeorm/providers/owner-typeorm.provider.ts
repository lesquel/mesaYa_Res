import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../../../auth/entities/user.entity.js';
import { type OwnerReaderPort } from '../../../../application/ports/index.js';

@Injectable()
export class OwnerTypeOrmProvider implements OwnerReaderPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async exists(ownerId: string): Promise<boolean> {
    if (!ownerId) {
      return false;
    }

    const count = await this.userRepository.count({ where: { id: ownerId } });
    return count > 0;
  }
}
