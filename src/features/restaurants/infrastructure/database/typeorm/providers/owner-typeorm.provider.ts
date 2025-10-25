import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { type OwnerReaderPort } from '../../../../application/ports';
import { IRestaurantOwnerPort } from '../../../../domain/ports/restaurant-owner.port';

@Injectable()
export class OwnerTypeOrmProvider
  implements OwnerReaderPort, IRestaurantOwnerPort
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async exists(ownerId: string): Promise<boolean> {
    if (!ownerId) {
      return false;
    }

    const count = await this.userRepository.count({ where: { id: ownerId } });
    return count > 0;
  }
}
