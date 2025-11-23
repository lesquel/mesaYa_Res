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
  GetImageAnalyticsUseCase,
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  IMAGE_STORAGE,
  IMAGE_ANALYTICS_REPOSITORY,
} from './application/index';
import { ImageOrmEntity } from './infrastructure/database/typeorm/orm/index';
import { ImageTypeOrmRepository } from './infrastructure/database/typeorm/repositories/image-typeorm.repository';
import { ImageAnalyticsTypeOrmRepository } from './infrastructure/database/typeorm/repositories/image-analytics-typeorm.repository';
import { ImageEventNoopProvider } from './infrastructure/providers/image-event-noop.provider';
import { SupabaseModule } from '@shared/infrastructure/supabase/index';
import { SupabaseImageStorageProvider } from './infrastructure/providers/supabase-image-storage.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageOrmEntity]),
    AuthModule,
    SupabaseModule,
  ],
  controllers: [ImagesController],
  providers: [
    {
      provide: IMAGE_REPOSITORY,
      useClass: ImageTypeOrmRepository,
    },
    {
      provide: IMAGE_ANALYTICS_REPOSITORY,
      useClass: ImageAnalyticsTypeOrmRepository,
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
    GetImageAnalyticsUseCase,
    ImagesService,
  ],
  exports: [
    CreateImageUseCase,
    ListImagesUseCase,
    FindImageUseCase,
    UpdateImageUseCase,
    DeleteImageUseCase,
    GetImageAnalyticsUseCase,
    ImagesService,
    IMAGE_REPOSITORY,
  ],
})
export class ImagesModule {}
