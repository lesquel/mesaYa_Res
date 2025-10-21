import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module.js';
import { ImagesController } from './interface/controllers/v1/images.controller.js';
import {
  CreateImageUseCase,
  DeleteImageUseCase,
  FindImageUseCase,
  ListImagesUseCase,
  UpdateImageUseCase,
  ImagesService,
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  IMAGE_STORAGE,
} from './application/index.js';
import { ImageOrmEntity } from './infrastructure/database/typeorm/orm/index.js';
import { ImageTypeOrmRepository } from './infrastructure/database/typeorm/repositories/image-typeorm.repository.js';
import { ImageEventNoopProvider } from './infrastructure/providers/image-event-noop.provider.js';
import { SupabaseModule } from '@shared/infrastructure/supabase/index.js';
import { SupabaseImageStorageProvider } from './infrastructure/providers/supabase-image-storage.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([ImageOrmEntity]), AuthModule, SupabaseModule],
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
    {
      provide: IMAGE_STORAGE,
      useClass: SupabaseImageStorageProvider,
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
