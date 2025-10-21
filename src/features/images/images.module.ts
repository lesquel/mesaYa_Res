import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { ImagesController } from './interface/controllers/v1/images.controller';
import {
  CreateImageUseCase,
  DeleteImageUseCase,
  FindImageUseCase,
  ListImagesUseCase,
  UpdateImageUseCase,
  ImagesService,
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
} from './application/index';
import { ImageOrmEntity } from './infrastructure/database/typeorm/orm/index';
import { ImageTypeOrmRepository } from './infrastructure/database/typeorm/repositories/image-typeorm.repository';
import { ImageEventNoopProvider } from './infrastructure/providers/image-event-noop.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity]), AuthModule],
  controllers: [ImagesController],
  providers: [
    {
      provide: IMAGE_REPOSITORY,
      useClass: ImageTypeOrmRepository,
    },
    {
      provide: IMAGE_EVENT_PUBLISHER,
      useClass: ImageEventNoopProvider,
    },
    CreateImageUseCase,
    ListImagesUseCase,
    FindImageUseCase,
    UpdateImageUseCase,
    DeleteImageUseCase,
    ImagesService,
  ],
  exports: [
    CreateImageUseCase,
    ListImagesUseCase,
    FindImageUseCase,
    UpdateImageUseCase,
    DeleteImageUseCase,
    ImagesService,
  ],
})
export class ImagesModule {}
