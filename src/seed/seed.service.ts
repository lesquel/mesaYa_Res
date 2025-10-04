import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  execute() {
    return `This action returns all seed`;
  }
}
