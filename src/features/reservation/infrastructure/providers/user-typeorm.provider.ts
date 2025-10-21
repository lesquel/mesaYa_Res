import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { type UserReservatioReaderPort } from '../../application/ports/index';
import {
  IReservationUserPort,
  type ReservationUserSnapshot,
} from '../../domain/ports';

@Injectable()
export class UserTypeOrmReservationProvider
  extends IReservationUserPort
  implements UserReservatioReaderPort
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async exists(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const count = await this.users.count({ where: { id: userId } });
    return count > 0;
  }

  async loadById(userId: string): Promise<ReservationUserSnapshot | null> {
    if (!userId) {
      return null;
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      active: user.active,
    };
  }
}
